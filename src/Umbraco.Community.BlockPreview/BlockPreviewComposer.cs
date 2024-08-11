﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.BlockPreview.Configuration;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Helpers;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Community.BlockPreview.ViewEngines;

namespace Umbraco.Community.BlockPreview
{
    internal class BlockPreviewComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddInternal(config => config.BindConfiguration(Constants.Configuration.AppSettingsRoot));

            builder.Services.AddScoped<IViewComponentHelperWrapper>(sp =>
            {
                if (sp.GetRequiredService<IViewComponentHelper>() is DefaultViewComponentHelper helper)
                {
                    return new ViewComponentHelperWrapper<DefaultViewComponentHelper>(helper);
                }

                throw new InvalidOperationException($"Expected {nameof(DefaultViewComponentHelper)} when resolving {nameof(IViewComponentHelperWrapper)}");
            });

            builder.Services.AddSingleton<IOperationIdHandler, BlockPreviewCustomOperationIdHandler>();

            builder.Services.AddScoped<IBlockPreviewService, BlockPreviewService>();
            builder.Services.AddScoped<ContextCultureService>();

            builder.Services.ConfigureOptions<BlockViewEngineOptionsSetup>();
        }
    }
}
