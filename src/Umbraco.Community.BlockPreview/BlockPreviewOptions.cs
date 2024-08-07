namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public BlockTypeSettings BlockGrid { get; set; }
        public BlockTypeSettings BlockList { get; set; }
        public BlockTypeSettings RichText { get; set; }

        public List<string>? GetAllViewLocations()
        {
            var locations = new List<string>();

            if (BlockGrid?.ViewLocations?.Any() == true)
                locations.AddRange(BlockGrid.ViewLocations);

            if (BlockList?.ViewLocations?.Any() == true)
                locations.AddRange(BlockList.ViewLocations);

            if (RichText?.ViewLocations?.Any() == true)
                locations.AddRange(RichText.ViewLocations);

            locations.Add(Constants.DefaultViewLocations.BlockGrid);
            locations.Add(Constants.DefaultViewLocations.BlockList);
            locations.Add(Constants.DefaultViewLocations.RichText);

            locations = locations.Distinct().ToList();

            return locations;
        }

        public BlockPreviewOptions()
        {
            BlockGrid = new();
            BlockList = new();
            RichText = new();
        }
    }

    public class BlockTypeSettings
    {
        public bool Enabled { get; set; } = false;
        public List<string>? ViewLocations { get; set; } = [];
        public List<string>? ContentTypes { get; set; } = [];
    }
}