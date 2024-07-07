using Umbraco.Cms.Core.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
namespace Umbraco.Community.BlockPreview.Extensions
{
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder)
            => builder.AddBlockPreview();

        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder, Action<BlockPreviewOptions> configure)
            => builder.AddBlockPreview(optionsBuilder => optionsBuilder.Configure(configure));

        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder,
            Action<OptionsBuilder<BlockPreviewOptions>>? configure = null)
        {
            ArgumentNullException.ThrowIfNull(builder);

            var optionsBuilder = builder.Services.AddOptions<BlockPreviewOptions>()
                .BindConfiguration(Constants.Configuration.AppPluginsRoot)
                .ValidateDataAnnotations();

            configure?.Invoke(optionsBuilder);

            return builder;
        }
    }
}