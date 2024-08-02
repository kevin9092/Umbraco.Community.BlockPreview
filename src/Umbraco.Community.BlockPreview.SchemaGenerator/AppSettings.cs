﻿namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class AppSettings
    {
        public BlockPreviewDefinition BlockPreview { get; set; }

        internal class BlockPreviewDefinition
        {
            public BlockTypeSettings BlockGrid { get; set; }
            public BlockTypeSettings BlockList { get; set; }
        }
    }

    public class BlockTypeSettings
    {
        public bool Enabled { get; set; }
        public string[] ViewLocations { get; set; }
        public string[] ContentTypes { get; set; }
    }
}
