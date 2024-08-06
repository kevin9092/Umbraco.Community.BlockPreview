using Umbraco.Cms.Core.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;

namespace Umbraco.Community.BlockPreview.Extensions
{
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder)
            => builder.AddInternal();

        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder, Action<BlockPreviewOptions> configure)
            => builder.AddInternal(optionsBuilder => optionsBuilder.Configure(configure));

        public static IUmbracoBuilder AddInternal(this IUmbracoBuilder builder,
            Action<OptionsBuilder<BlockPreviewOptions>>? configure = null)
        {
            ArgumentNullException.ThrowIfNull(builder);

            var optionsBuilder = builder.Services.AddOptions<BlockPreviewOptions>()
                .BindConfiguration(Constants.Configuration.AppSettingsRoot)
                .ValidateDataAnnotations();

            configure?.Invoke(optionsBuilder);

            return builder;
        }
    }
}