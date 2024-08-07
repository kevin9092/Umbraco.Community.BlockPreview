﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeGridPreviewService : BackOfficePreviewServiceBase, IBackOfficeGridPreviewService
    {
        private readonly ContextCultureService _contextCultureService;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly IDataTypeService _dataTypeService;

        public BackOfficeGridPreviewService(
            BlockEditorConverter blockEditorConverter,
            ContextCultureService contextCultureService,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IOptions<BlockPreviewOptions> options,
            IRazorViewEngine razorViewEngine,
            IJsonSerializer jsonSerializer,
            IDataTypeService dataTypeService)
            : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine, typeFinder, blockEditorConverter, viewComponentSelector, publishedValueFallback, options)
        {
            _contextCultureService = contextCultureService;
            _jsonSerializer = jsonSerializer;
            _dataTypeService = dataTypeService;
        }

        public override async Task<string> GetMarkupForBlock(
            IPublishedContent page,
            string blockData,
            string blockEditorAlias,
            ControllerContext controllerContext,
            string? culture)
        {
            if (!string.IsNullOrEmpty(culture))
            {
                _contextCultureService.SetCulture(culture);
            }

            var converter = new BlockGridEditorDataConverter(_jsonSerializer);
            converter.TryDeserialize(blockData, out BlockEditorData<BlockGridValue, BlockGridLayoutItem>? blockValue);

            BlockItemData? contentData = blockValue?.BlockValue?.ContentData.FirstOrDefault();
            BlockItemData? settingsData = blockValue?.BlockValue?.SettingsData.FirstOrDefault();

            if (contentData != null)
            {
                ConvertNestedValuesToString(contentData);

                IPublishedElement? contentElement = ConvertToElement(contentData, true);
                string? contentTypeAlias = contentElement?.ContentType.Alias;

                IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;
                string? settingsTypeAlias = settingsElement?.ContentType.Alias;

                Type? contentBlockType = FindBlockType(contentTypeAlias);
                Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsTypeAlias) : default;

                object? blockInstance = CreateBlockInstance(true, false, contentBlockType, contentElement, settingsBlockType, settingsElement, contentData.Udi, settingsData?.Udi);

                BlockGridItem? typedBlockInstance = blockInstance as BlockGridItem;

                var contentProperty = page.Properties.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));
                if (contentProperty != null)
                {
                    BlockGridModel? typedBlockGridModel = contentProperty.GetValue(culture) as BlockGridModel;
                    UpdateBlockGridItem(typedBlockGridModel, contentData, ref typedBlockInstance);
                }

                ViewDataDictionary? viewData = CreateViewData(typedBlockInstance);

                return await GetMarkup(controllerContext, contentTypeAlias, viewData);
            }

            return string.Empty;
        }

        private static void UpdateBlockGridItem(BlockGridModel? typedBlockGridModel, BlockItemData? contentData, ref BlockGridItem? typedBlockInstance)
        {
            if (typedBlockGridModel == null || contentData == null || typedBlockInstance == null)
                return;

            var blockGridItem = typedBlockGridModel
                .SelectMany(item => new[] { item }.Concat(item.Areas.SelectMany(area => area)))
                .FirstOrDefault(item => item.ContentUdi == contentData.Udi);

            if (blockGridItem == null)
                return;

            typedBlockInstance.RowSpan = blockGridItem.RowSpan;
            typedBlockInstance.ColumnSpan = blockGridItem.ColumnSpan;
            typedBlockInstance.AreaGridColumns = blockGridItem.AreaGridColumns;
            typedBlockInstance.GridColumns = blockGridItem.GridColumns;
            typedBlockInstance.Areas = blockGridItem.Areas;
        }

        public override ViewDataDictionary CreateViewData(object? typedBlockInstance)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;
            viewData["blockGridPreview"] = true;
            return viewData;
        }
    }
}