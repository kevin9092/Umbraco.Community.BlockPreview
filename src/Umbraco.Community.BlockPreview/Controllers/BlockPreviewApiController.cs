using HtmlAgilityPack;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Services;
using Asp.Versioning;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Core.Strings;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Represents the Block Preview API controller.
    /// </summary>
    [ApiVersion("1.0")]
    [VersionedApiBackOfficeRoute("block-preview")]
    public class BlockPreviewApiController : BlockPreviewApiControllerBase
    {
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILogger<BlockPreviewApiController> _logger;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ContextCultureService _contextCultureService;
        private readonly IBackOfficeListPreviewService _backOfficeListPreviewService;
        private readonly IBackOfficeGridPreviewService _backOfficeGridPreviewService;
        private readonly IBackOfficeRtePreviewService _backOfficeRtePreviewService;
        private readonly ILanguageService _languageService;
        private readonly ISiteDomainMapper _siteDomainMapper;
        private readonly BlockPreviewOptions _blockPreviewSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        public BlockPreviewApiController(
            IPublishedRouter publishedRouter,
            ILogger<BlockPreviewApiController> logger,
            IUmbracoContextAccessor umbracoContextAccessor,
            ContextCultureService contextCultureSwitcher,
            IBackOfficeListPreviewService backOfficeListPreviewService,
            IBackOfficeGridPreviewService backOfficeGridPreviewService,
            IBackOfficeRtePreviewService backOfficeRtePreviewService,
            ILanguageService languageService,
            ISiteDomainMapper siteDomainMapper,
            IOptionsMonitor<BlockPreviewOptions> blockPreviewSettings)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _backOfficeListPreviewService = backOfficeListPreviewService;
            _backOfficeGridPreviewService = backOfficeGridPreviewService;
            _backOfficeRtePreviewService = backOfficeRtePreviewService;
            _languageService = languageService;
            _siteDomainMapper = siteDomainMapper;
            _blockPreviewSettings = blockPreviewSettings.CurrentValue;
        }

        /// <summary>
        /// Renders a preview for a grid block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="data">The JSON content data of the block.</param>
        /// <param name="pageId">The current page id.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="culture">The culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/grid")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewGridMarkup(
            [FromBody] string blockData,
            [FromQuery] Guid pageKey = default(Guid),
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string? culture = "")
        {
            string markup;

            try
            {
                IPublishedContent? page = null;

                // If the page is new, then the ID will be zero
                if (pageKey != Guid.Empty)
                {
                    page = GetPublishedContentForPage(pageKey);
                }

                if (page == null)
                {
                    return Ok("<div class=\"preview-alert preview-alert-warning\"><strong>Cannot create a preview:</strong> the page must be saved before a preview can be created</div>");
                }

                string? currentCulture = await GetCurrentCulture(page, culture);

                await SetupPublishedRequest(page, currentCulture);

                markup = await _backOfficeGridPreviewService.GetMarkupForBlock(page, blockData, blockEditorAlias, ControllerContext, culture);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"alert alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, "Error rendering preview for block");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Renders a preview for a list block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="data">The JSON content data of the block.</param>
        /// <param name="pageId">The current page id.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="culture">The culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/list")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewListMarkup(
            [FromBody] string blockData,
            [FromQuery] Guid pageKey = default(Guid),
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string culture = "")
        {
            string markup;

            try
            {
                IPublishedContent? page = null;

                // If the page is new, then the ID will be zero
                if (pageKey != Guid.Empty)
                {
                    page = GetPublishedContentForPage(pageKey);
                }

                if (page == null)
                {
                    return Ok("<div class=\"preview-alert preview-alert-warning\"><strong>Cannot create a preview:</strong> the page must be saved before a preview can be created</div>");
                }

                string? currentCulture = await GetCurrentCulture(page, culture);

                await SetupPublishedRequest(page, currentCulture);

                markup = await _backOfficeListPreviewService.GetMarkupForBlock(page, blockData, blockEditorAlias, ControllerContext, culture);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"alert alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {blockEditorAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Renders a preview for a list block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="data">The JSON content data of the block.</param>
        /// <param name="pageId">The current page id.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="culture">The culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/rte")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewRichTextMarkup(
            [FromBody] string blockData,
            [FromQuery] Guid pageKey = default(Guid),
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string culture = "")
        {
            string markup;

            try
            {
                IPublishedContent? page = null;

                // If the page is new, then the ID will be zero
                if (pageKey != Guid.Empty)
                {
                    page = GetPublishedContentForPage(pageKey);
                }

                if (page == null)
                {
                    return Ok("<div class=\"preview-alert preview-alert-warning\"><strong>Cannot create a preview:</strong> the page must be saved before a preview can be created</div>");
                }

                string? currentCulture = await GetCurrentCulture(page, culture);

                await SetupPublishedRequest(page, currentCulture);

                markup = await _backOfficeRtePreviewService.GetMarkupForBlock(page, blockData, blockEditorAlias, ControllerContext, culture);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"alert alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {blockEditorAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Loads the in-memory settings from appsettings.json
        /// </summary>
        /// <returns><see cref="BlockPreviewOptions">Block Preview settings</see></returns>
        [AllowAnonymous]
        [HttpGet("settings")]
        [ProducesResponseType(typeof(BlockPreviewOptions), 200)]
        public BlockPreviewOptions GetSettings()
        {
            return _blockPreviewSettings;
        }

        private async Task<string?> GetCurrentCulture(IPublishedContent page, string? culture)
        {
            // if in a culture variant setup also set the correct language.
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? page.GetCultureFromDomains(_umbracoContextAccessor, _siteDomainMapper)
                : culture;

            if (currentCulture == "undefined")
                currentCulture = await _languageService.GetDefaultIsoCodeAsync();

            return currentCulture;
        }

        private async Task SetupPublishedRequest(IPublishedContent page, string? culture)
        {
            // set the published request for the page we are editing in the back office
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return;

            // set the published request
            var requestBuilder = await _publishedRouter.CreateRequestAsync(new Uri(Request.GetDisplayUrl()));
            requestBuilder.SetPublishedContent(page);
            context.PublishedRequest = requestBuilder.Build();
            context.ForcedPreview(true);

            if (culture == null)
                return;

            _contextCultureService.SetCulture(culture);
        }

        private IPublishedContent? GetPublishedContentForPage(Guid pageKey)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            // Get page from published cache.
            // If unpublished, then get it from preview
            return context.Content?.GetById(pageKey) ?? context.Content?.GetById(true, pageKey);
        }

        private static string CleanUpMarkup(string markup)
        {
            if (string.IsNullOrWhiteSpace(markup))
                return markup;

            var content = new HtmlDocument();
            content.LoadHtml(markup);

            // make sure links are not clickable in the back office, because this will prevent editing
            var links = content.DocumentNode.SelectNodes("//a");

            if (links != null)
            {
                foreach (var link in links)
                {
                    link.SetAttributeValue("href", "javascript:;");
                }
            }

            // disable forms so they can't be submitted via tab
            var formElements = content.DocumentNode.SelectNodes("//input | //textarea | //select | //button");
            if (formElements != null)
            {
                foreach (var formElement in formElements)
                {
                    formElement.SetAttributeValue("disabled", "disabled");
                }
            }

            return content.DocumentNode.OuterHtml;
        }
    }
}
