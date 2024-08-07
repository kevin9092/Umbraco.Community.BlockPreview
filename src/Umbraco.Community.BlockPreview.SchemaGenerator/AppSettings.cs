using System.Collections.Generic;

namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class AppSettings
    {
        public BlockPreviewDefinition BlockPreview { get; set; }

        internal class BlockPreviewDefinition
        {
            public BlockTypeSettings BlockGrid { get; set; }
            public BlockTypeSettings BlockList { get; set; }
            public BlockTypeSettings RichText { get; set; }
        }
    }

    public class BlockTypeSettings
    {
        public bool Enabled { get; set; }
        public List<string> ViewLocations { get; set; }
        public List<string> ContentTypes { get; set; }
    }
}
