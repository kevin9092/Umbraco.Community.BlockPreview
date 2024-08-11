using Microsoft.AspNetCore.Mvc;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBlockPreviewService
    {
        Task<string> RenderGridBlock(string blockData, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default);

        Task<string> RenderListBlock(string blockData, ControllerContext controllerContext);

        Task<string> RenderRichTextBlock(string blockData, ControllerContext controllerContext);
    }
}
