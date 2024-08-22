namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class AppSettings
    {
        public BlockPreviewDefinition BlockPreview { get; set; }

        internal class BlockPreviewDefinition
        {
            public BlockGridSettings BlockGrid { get; set; }
            public BlockTypeSettings BlockList { get; set; }
            public BlockTypeSettings RichText { get; set; }
        }
    }
}
