﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text.Encodings.Web;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    public class BlockPreviewService : IBlockPreviewService
    {
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly BlockPreviewOptions _options;
        private readonly ITypeFinder _typeFinder;
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly IDataTypeService _dataTypeService;
        private readonly IContentTypeService _contentTypeService;

        public BlockPreviewService(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            ITypeFinder typeFinder,
            BlockEditorConverter blockEditorConverter,
            IViewComponentSelector viewComponentSelector,
            IPublishedValueFallback publishedValueFallback,
            IOptions<BlockPreviewOptions> options,
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _typeFinder = typeFinder;
            _blockEditorConverter = blockEditorConverter;
            _viewComponentSelector = viewComponentSelector;
            _publishedValueFallback = publishedValueFallback;
            _options = options.Value;
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
        }

        public async Task<string> RenderGridBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            if (blockData == null)
                return string.Empty;

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Empty;

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Empty;

            ConvertNestedValuesToString(contentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockData.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            BlockGridItem? blockInstance = CreateBlockInstance(
                BlockType.BlockGrid,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Udi, settingsData?.Udi
            ) as BlockGridItem;

            if (blockInstance == null)
                return string.Empty;

            string? layoutItemJson = blockData?.Layout?.FirstOrDefault().Value.FirstOrDefault()!.ToString();
            BlockGridLayoutItem? layoutItem = null;

            if (!string.IsNullOrEmpty(layoutItemJson))
            {
                layoutItem = JsonConvert.DeserializeObject<BlockGridLayoutItem>(layoutItemJson);
                if (layoutItem != null)
                {
                    blockInstance.RowSpan = layoutItem.RowSpan!.Value;
                    blockInstance.ColumnSpan = layoutItem.ColumnSpan!.Value;
                }
            }

            IContentType? documentType = _contentTypeService.Get(documentTypeUnique);
            if (documentType == null)
                return string.Empty;

            IPropertyType? property = documentType.PropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));
            if (property == null)
            {
                property = documentType.CompositionPropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));

                if (property == null)
                    return string.Empty;
            }

            IDataType? dataType = _dataTypeService.GetAll(property.DataTypeId).FirstOrDefault();
            if (dataType == null)
                return string.Empty;

            BlockGridConfiguration? config = dataType.ConfigurationAs<BlockGridConfiguration>();
            if (config == null)
                return string.Empty;

            BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlock = config.Blocks.FirstOrDefault(x => x.ContentElementTypeKey == contentData.ContentTypeKey);
            if (matchingBlock == null)
                return string.Empty;

            ConfigureBlockGridAreas(blockInstance, config, matchingBlock, layoutItem!, blockData!);

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockGrid);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockGrid);
        }

        public async Task<string> RenderListBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            if (blockData == null)
                return string.Empty;

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Empty;

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Empty;

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockData.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            BlockListItem? blockInstance = CreateBlockInstance(
                BlockType.BlockList,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Empty;

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockList);
        }

        private void ConfigureBlockGridAreas(
            BlockGridItem blockInstance,
            BlockGridConfiguration config,
            BlockGridConfiguration.BlockGridBlockConfiguration matchingBlock,
            BlockGridLayoutItem layoutItem,
            BlockValue blockValue)
        {
            blockInstance.AreaGridColumns = matchingBlock.AreaGridColumns ?? 12;
            blockInstance.GridColumns = config.GridColumns ?? 12;

            var blockConfigAreaMap = matchingBlock.Areas.ToDictionary(area => area.Key);
            if (layoutItem == null || blockConfigAreaMap == null || !blockConfigAreaMap.Any())
                return;

            blockInstance.Areas = layoutItem.Areas.Select(area =>
            {
                if (!blockConfigAreaMap.TryGetValue(area.Key, out var areaConfig))
                    return null;

                var items = area.Items.Select(item =>
                {
                    BlockItemData? areaContentData = blockValue.ContentData.FirstOrDefault(x => x.Udi == item.ContentUdi);
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, true);

                    BlockItemData? areaSettingsData = blockValue.SettingsData.FirstOrDefault(x => x.Udi == item.SettingsUdi);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, true) : default;

                    return new BlockGridItem(item.ContentUdi!, areaContentElement!, item.SettingsUdi!, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(items, areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToList();
        }

#if NET8_0
        public async Task<string> RenderRichTextBlock(
            BlockValue blockData,
            ControllerContext controllerContext)
        {
            if (blockData == null)
                return string.Empty;

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Empty;

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = blockData.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            RichTextBlockItem? blockInstance = CreateBlockInstance(
                BlockType.RichText,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as RichTextBlockItem;

            if (blockInstance == null)
                return string.Empty;

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.RichText);
        }
#endif

        private void ConvertNestedValuesToString(BlockItemData? blockData)
        {
            if (blockData == null)
                return;

            foreach (var rawPropValue in blockData.RawPropertyValues.Where(x => x.Value != null))
            {
                var originalValue = rawPropValue.Value;
                if (originalValue.TryConvertToGridItem(out BlockValue? blockValue))
                {
                    blockValue?.ContentData.ForEach(ConvertNestedValuesToString);
                    blockValue?.SettingsData.ForEach(ConvertNestedValuesToString);
                    blockData.RawPropertyValues[rawPropValue.Key] = JsonConvert.SerializeObject(blockValue);
                    continue;
                }
                blockData.RawPropertyValues[rawPropValue.Key] = originalValue?.ToString();
            }
        }
        private IPublishedElement? ConvertToElement(BlockItemData data, bool throwOnError)
        {
            var element = _blockEditorConverter.ConvertToElement(data, PropertyCacheLevel.None, throwOnError);
            if (element == null && throwOnError)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        private Type? FindBlockType(string? contentTypeAlias) =>
            _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false)?.ContentTypeAlias == contentTypeAlias);

        private ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockType? blockType = default)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;

            if (blockType == BlockType.BlockGrid)
                viewData["blockGridPreview"] = true;

            return viewData;
        }

        private object? CreateBlockInstance(BlockType blockType, Type? contentBlockType, IPublishedElement? contentElement, Type? settingsBlockType, IPublishedElement? settingsElement, Udi? contentUdi, Udi? settingsUdi)
        {
            if (contentBlockType != null)
            {
                var contentInstance = Activator.CreateInstance(contentBlockType, contentElement, _publishedValueFallback);
                var settingsInstance = settingsBlockType != null ? Activator.CreateInstance(settingsBlockType, settingsElement, _publishedValueFallback) : null;

                Type blockItemType;
                if (blockType == BlockType.BlockGrid)
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(BlockGridItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(BlockGridItem<>).MakeGenericType(contentBlockType);
                }
#if NET8_0
                else if (blockType == BlockType.RichText)
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(RichTextBlockItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(RichTextBlockItem<>).MakeGenericType(contentBlockType);

                }
#endif
                else
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(BlockListItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(BlockListItem<>).MakeGenericType(contentBlockType);
                }

                return Activator.CreateInstance(blockItemType, contentUdi, contentInstance, settingsUdi, settingsInstance);
            }

            return null;
        }

        private async Task<string> GetMarkup(ControllerContext controllerContext, string? contentAlias, ViewDataDictionary viewData, BlockType blockType)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            return viewComponent != null
                ? await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent)
                : await GetMarkupFromPartial(controllerContext, viewData, contentAlias, blockType);
        }

        private async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary? viewData,
            string? contentAlias,
            BlockType blockType)
        {
            var viewResult = GetViewResult(contentAlias, blockType);

            if (viewResult == null)
            {
                viewResult =
                    _razorViewEngine.FindView(controllerContext, contentAlias!, false) ??
                    _razorViewEngine.FindView(controllerContext, contentAlias?.ToPascalCase()!, false);

                if (!viewResult.Success)
                    return string.Empty;
            }

            var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());

            if (viewResult.View == null)
                return string.Empty;

            await using var sw = new StringWriter();

            if (viewData != null)
            {
                var viewContext = new ViewContext(actionContext, viewResult.View, viewData,
                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);
            }

            return sw.ToString();
        }

        private async Task<string> GetMarkupFromViewComponent(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            ViewComponentDescriptor viewComponent)
        {
            await using var sw = new StringWriter();
            var viewContext = new ViewContext(
                controllerContext,
                new FakeView(),
                viewData,
                new TempDataDictionary(controllerContext.HttpContext, _tempDataProvider),
                sw,
                new HtmlHelperOptions());

            _viewComponentHelperWrapper.Contextualize(viewContext);

            var result = await _viewComponentHelperWrapper.InvokeAsync(viewComponent.TypeInfo.AsType(), viewData.Model);
            result.WriteTo(sw, HtmlEncoder.Default);
            return sw.ToString();
        }

        private async Task<string> GetMarkupForBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            return await Task.FromResult(string.Empty);
        }

        private ViewEngineResult? GetViewResult(string? contentAlias, BlockType blockType)
        {
            var viewPaths = _options.GetViewLocations(blockType);

            if (viewPaths == null || !viewPaths.Any())
                return null;

            foreach (var viewPath in viewPaths)
            {
                var formattedViewPath = $"~{viewPath}";
                var viewResult = _razorViewEngine.GetView("", string.Format(formattedViewPath, contentAlias), false);

                if (viewResult.Success)
                    return viewResult;

                viewResult = _razorViewEngine.GetView("", string.Format(formattedViewPath, contentAlias?.ToPascalCase()), false);

                if (viewResult.Success)
                    return viewResult;
            }

            return null;
        }

        private sealed class FakeView : IView
        {
            public string Path => string.Empty;

            public Task RenderAsync(ViewContext context)
            {
                return Task.CompletedTask;
            }
        }
    }
}