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
    public sealed class BackOfficeListPreviewService : BackOfficePreviewServiceBase, IBackOfficeListPreviewService
    {
        private readonly ContextCultureService _contextCultureService;

        public BackOfficeListPreviewService(
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
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
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

            BlockListItem? blockInstance = CreateBlockInstance(
                isGrid: false, isRte: false,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Empty;

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData);
        }
    }
}