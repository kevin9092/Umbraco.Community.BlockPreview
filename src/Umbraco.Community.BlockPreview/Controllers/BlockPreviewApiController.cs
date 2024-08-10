﻿using System;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Extensions;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models.Blocks;
using System.Linq;
using Umbraco.Community.BlockPreview.Services;

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
        private readonly IBackOfficeListPreviewService _backOfficeListPreviewService;
        private readonly IBackOfficeGridPreviewService _backOfficeGridPreviewService;
        private readonly IBackOfficeRtePreviewService _backOfficeRtePreviewService;
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
            IBackOfficeListPreviewService backOfficeListPreviewService,
            IBackOfficeGridPreviewService backOfficeGridPreviewService,
            IBackOfficeRtePreviewService backOfficeRtePreviewService,
            ILocalizationService localizationService,
            ISiteDomainMapper siteDomainMapper)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _backOfficeListPreviewService = backOfficeListPreviewService;
            _backOfficeGridPreviewService = backOfficeGridPreviewService;
            _backOfficeRtePreviewService = backOfficeRtePreviewService;
            _localizationService = localizationService;
            _siteDomainMapper = siteDomainMapper;
        }

        /// <summary>
        /// Renders a preview for a block using the associated razor view.
        /// </summary>
        /// <param name="content">The JSON content data of the block.</param>
        /// <param name="settings">The JSON settings data of the block.</param>
        /// <param name="pageId">The current page id.</param>
        /// <param name="culture">The culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        public async Task<IActionResult> PreviewMarkup(
            [FromBody] BlockValue blockData,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeKey = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] bool isGrid = false,
            [FromQuery] bool isList = false,
            [FromQuery] bool isRte = false)
        {
            string markup = "";

            try
            {
                string? currentCulture = GetCurrentCulture(culture);

                await SetupPublishedRequest(currentCulture);

                if (isGrid)
                {
                    markup = await _backOfficeGridPreviewService.GetMarkupForBlock(blockData, ControllerContext, blockEditorAlias, documentTypeKey, contentUdi, settingsUdi);
                }
                if (isRte)
                {
                    markup = await _backOfficeRtePreviewService.GetMarkupForBlock(blockData, ControllerContext, blockEditorAlias);
                }
                if (isList)
                {
                    markup = await _backOfficeListPreviewService.GetMarkupForBlock(blockData, ControllerContext, blockEditorAlias);
                }
            }
            catch (Exception ex)
            {
                markup = $"<div class=\"preview-alert preview-alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{ex.Message}</pre></div>";
                _logger.LogError(ex, $"Error rendering preview for block {blockEditorAlias}");
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        private string? GetCurrentCulture(string culture)
        {
            // if in a culture variant setup also set the correct language.
            //var currentCulture = string.IsNullOrWhiteSpace(culture)
            //    ? page.GetCultureFromDomains(_umbracoContextAccessor, _siteDomainMapper)
            //    : culture;

            if (string.IsNullOrEmpty(culture) || culture == "undefined")
                culture = _localizationService.GetDefaultLanguageIsoCode();

            return culture;
        }

        private async Task SetupPublishedRequest(string? culture)
        {
            // set the published request for the page we are editing in the back office
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return;

            // set the published request
            var requestBuilder = await _publishedRouter.CreateRequestAsync(new Uri(Request.GetDisplayUrl()));
            //requestBuilder.SetPublishedContent(page);
            context.PublishedRequest = requestBuilder.Build();
            context.ForcedPreview(true);

            if (culture == null)
                return;

            _contextCultureService.SetCulture(culture);
        }

        private IPublishedContent? GetPublishedContentForPage(int pageId)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            // Get page from published cache.
            // If unpublished, then get it from preview
            return context.Content?.GetById(pageId) ?? context.Content?.GetById(true, pageId);
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
