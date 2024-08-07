#if NET8_0
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeRtePreviewService : BackOfficePreviewServiceBase, IBackOfficeRtePreviewService
    {
        private readonly ContextCultureService _contextCultureService;

        public BackOfficeRtePreviewService(
            BlockEditorConverter blockEditorConverter,
            ContextCultureService contextCultureService,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IOptions<BlockPreviewOptions> options,
            IRazorViewEngine razorViewEngine) : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine, typeFinder, blockEditorConverter, viewComponentSelector, publishedValueFallback, options)
        {            
            _contextCultureService = contextCultureService;
        }

        public override async Task<string> GetMarkupForBlock(
            IPublishedContent page,
            BlockValue blockValue,
            string blockEditorAlias,
            ControllerContext controllerContext,
            string? culture)
        {
            if (!string.IsNullOrEmpty(culture))
            {
                _contextCultureService.SetCulture(culture);
            }

            BlockItemData? contentData = blockValue.ContentData.FirstOrDefault();
            BlockItemData? settingsData = blockValue.SettingsData.FirstOrDefault();

            if (contentData != null)
            {
                ConvertNestedValuesToString(contentData);

                IPublishedElement? contentElement = ConvertToElement(contentData, true);
                string? contentTypeAlias = contentElement?.ContentType.Alias;

                IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;
                string? settingsTypeAlias = settingsElement?.ContentType.Alias;

                Type? contentBlockType = FindBlockType(contentTypeAlias);
                Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsTypeAlias) : default;

                object? blockInstance = CreateBlockInstance(isGrid: false, isRte: true, contentBlockType, contentElement, settingsBlockType, settingsElement, contentData.Udi, settingsData?.Udi);

                RichTextBlockItem? typedBlockInstance = blockInstance as RichTextBlockItem;

                ViewDataDictionary? viewData = CreateViewData(typedBlockInstance);

                return await GetMarkup(controllerContext, contentTypeAlias, viewData);
            }

            return string.Empty;
        }
    }
}
#endif