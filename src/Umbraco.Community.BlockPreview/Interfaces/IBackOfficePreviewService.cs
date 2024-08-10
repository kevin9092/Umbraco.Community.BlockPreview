using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.Blocks;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBackOfficePreviewService
    {
        void ConvertNestedValuesToString(BlockItemData? contentData);
        Type? FindBlockType(string? contentTypeAlias);
        ViewDataDictionary CreateViewData(object? typedBlockInstance);
        Task<string> GetMarkup(ControllerContext controllerContext, string contentAlias, ViewDataDictionary viewData, bool isGrid = false);
        Task<string> GetMarkupForBlock(BlockValue blockData, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default);
        Task<string> GetMarkupFromViewComponent(ControllerContext controllerContext, ViewDataDictionary viewData, ViewComponentDescriptor viewComponent);
    }
}
