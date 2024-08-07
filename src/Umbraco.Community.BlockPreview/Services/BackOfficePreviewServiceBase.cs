using Microsoft.AspNetCore.Mvc;
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
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    public class BackOfficePreviewServiceBase : IBackOfficePreviewService
    {
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly BlockPreviewOptions _options;
        private readonly ITypeFinder _typeFinder;
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IPublishedValueFallback _publishedValueFallback;

        public BackOfficePreviewServiceBase(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            ITypeFinder typeFinder,
            BlockEditorConverter blockEditorConverter,
            IViewComponentSelector viewComponentSelector,
            IPublishedValueFallback publishedValueFallback,
            IOptions<BlockPreviewOptions> options)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _typeFinder = typeFinder;
            _blockEditorConverter = blockEditorConverter;
            _viewComponentSelector = viewComponentSelector;
            _publishedValueFallback = publishedValueFallback;
            _options = options.Value;
        }

        public virtual void ConvertNestedValuesToString(BlockItemData? blockData)
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
        public virtual IPublishedElement? ConvertToElement(BlockItemData data, bool throwOnError)
        {
            var element = _blockEditorConverter.ConvertToElement(data, PropertyCacheLevel.None, throwOnError);
            if (element == null && throwOnError)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        public virtual Type? FindBlockType(string? contentTypeAlias) =>
            _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false)?.ContentTypeAlias == contentTypeAlias);

        public virtual ViewDataDictionary CreateViewData(object? typedBlockInstance)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;
            return viewData;
        }

        public virtual object? CreateBlockInstance(bool isGrid, bool isRte, Type? contentBlockType, IPublishedElement? contentElement, Type? settingsBlockType, IPublishedElement? settingsElement, Udi? contentUdi, Udi? settingsUdi)
        {
            if (contentBlockType != null)
            {
                var contentInstance = Activator.CreateInstance(contentBlockType, contentElement, _publishedValueFallback);
                var settingsInstance = settingsBlockType != null ? Activator.CreateInstance(settingsBlockType, settingsElement, _publishedValueFallback) : null;

                Type blockItemType;
                if (settingsBlockType != null)
                {
                    if (isGrid)
                    {
                        blockItemType = typeof(BlockGridItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                    }
#if NET8_0
                    else if (isRte)
                    {
                        blockItemType = typeof(RichTextBlockItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                    }
#endif
                    else
                    {
                        blockItemType = typeof(BlockListItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                    }
                }
                else
                {
                    if (isGrid)
                    {
                        blockItemType = typeof(BlockGridItem<>).MakeGenericType(contentBlockType);
                    }
#if NET8_0
                    else if (isRte)
                    {
                        blockItemType = typeof(RichTextBlockItem<>).MakeGenericType(contentBlockType);
                    }
#endif
                    else
                    {
                        blockItemType = typeof(BlockListItem<>).MakeGenericType(contentBlockType);
                    }
                }

                return Activator.CreateInstance(blockItemType, contentUdi, contentInstance, settingsUdi, settingsInstance);
            }

            return null;
        }

        public virtual async Task<string> GetMarkup(ControllerContext controllerContext, string? contentAlias, ViewDataDictionary viewData, bool isGrid = false)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            return viewComponent != null
                ? await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent)
                : await GetMarkupFromPartial(controllerContext, viewData, contentAlias, isGrid);
        }

        public virtual async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary? viewData,
            string? contentAlias,
            bool isGrid = false,
            bool isRte = false)
        {
            var viewResult = FindViewResult(contentAlias);

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

        public virtual async Task<string> GetMarkupFromViewComponent(
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

        public virtual async Task<string> GetMarkupForBlock(
            IPublishedContent page,
            BlockValue blockValue,
            string blockEditorAlias,
            ControllerContext controllerContext,
            string? culture)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        private ViewEngineResult? FindViewResult(string? contentAlias)
        {
            var viewPaths = _options.GetAllViewLocations();

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