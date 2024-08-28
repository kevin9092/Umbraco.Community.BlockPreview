﻿using HtmlAgilityPack;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Represents the Block Preview API controller.
    /// </summary>
    public class BlockPreviewApiController : UmbracoAuthorizedJsonController
    {
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILogger<BlockPreviewApiController> _logger;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ContextCultureService _contextCultureService;
        private readonly IBlockPreviewService _blockPreviewService;
        private readonly ILocalizationService _localizationService;
        private readonly ISiteDomainMapper _siteDomainMapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        public BlockPreviewApiController(
            IPublishedRouter publishedRouter,
            ILogger<BlockPreviewApiController> logger,
            IUmbracoContextAccessor umbracoContextAccessor,
            ContextCultureService contextCultureSwitcher,
            IBlockPreviewService blockPreviewService,
            ILocalizationService localizationService,
            ISiteDomainMapper siteDomainMapper)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _blockPreviewService = blockPreviewService;
            _localizationService = localizationService;
            _siteDomainMapper = siteDomainMapper;
        }

        /// <summary>
        /// Renders a preview for a grid block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewGridBlock(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string? culture = "",
            [FromQuery] Guid documentTypeKey = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default)
        {
            string markup;

            try
            {
                IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                string? currentCulture = GetCurrentCulture(culture, content);

                await SetupPublishedRequest(currentCulture, content);

                markup = await _blockPreviewService.RenderGridBlock(blockData, ControllerContext, blockEditorAlias, documentTypeKey, contentUdi, settingsUdi);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"preview-alert preview-alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {contentElementAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Renders a preview for a list block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewListBlock(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeKey = default)
        {
            string markup;
            _ = culture;

            try
            {
                IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                string? currentCulture = GetCurrentCulture(culture, content);

                await SetupPublishedRequest(currentCulture, content);

                markup = await _blockPreviewService.RenderListBlock(blockData, ControllerContext);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"preview-alert preview-alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {contentElementAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

#if NET8_0
        /// <summary>
        /// Renders a preview for a rich text block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewRichTextMarkup(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeKey = default)
        {
            string markup;

            try
            {
                IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                string? currentCulture = GetCurrentCulture(culture, content);

                await SetupPublishedRequest(currentCulture, content);

                markup = await _blockPreviewService.RenderRichTextBlock(blockData, ControllerContext);
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"preview-alert preview-alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {contentElementAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }
#endif

        private string GetCurrentCulture(string? culture, IPublishedContent? content = null)
        {
            // if in a culture variant setup also set the correct language.
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? content?.GetCultureFromDomains(_umbracoContextAccessor, _siteDomainMapper)
                : culture;

            if (string.IsNullOrEmpty(currentCulture) || currentCulture == "undefined")
                currentCulture = _localizationService.GetDefaultLanguageIsoCode();

            _contextCultureService.SetCulture(currentCulture);

            return currentCulture;
        }

        private async Task SetupPublishedRequest(string? culture, IPublishedContent? content = null)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return;

            var requestUrl = new Uri(Request.GetDisplayUrl());
            var requestBuilder = await _publishedRouter.CreateRequestAsync(requestUrl);
            
            if (content != null)
                requestBuilder.SetPublishedContent(content);

            context.PublishedRequest = requestBuilder.Build();
            context.ForcedPreview(true);
        }

        private IPublishedContent? GetPublishedContent(Guid? nodeKey = default, Guid? documentTypeKey = default)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            IPublishedContent? content = null;

            if (nodeKey != default)
                content = context.Content?.GetById(true, nodeKey.GetValueOrDefault());

            if (content == null)
            {
                var contentType = context.Content?.GetContentType(documentTypeKey.GetValueOrDefault());
                if (contentType != null)
                {
                    var cache = context.Content?.GetByContentType(contentType);
                    return cache?.FirstOrDefault();
                }
            }

            return content;
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
