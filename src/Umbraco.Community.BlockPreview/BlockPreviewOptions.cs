namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public BlockTypeSettings BlockGrid { get; set; }
        public BlockTypeSettings BlockList { get; set; }

        public IEnumerable<string>? GetAllViewLocations() => BlockGrid?.ViewLocations?.Concat(BlockList?.ViewLocations!);

        public BlockPreviewOptions()
        {
            BlockGrid = new();
            BlockList = new();
        }
    }

    public class BlockTypeSettings
    {
        public bool Enabled { get; set; } = false;
        public string[]? ViewLocations { get; set; } = [];
        public string[]? ContentTypes { get; set; } = [];
    }
}