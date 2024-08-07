namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public ViewLocations ViewLocations { get; set; }

        public List<string>? GetAllViewLocations()
        { 
            var locations = new List<string>();

            if (ViewLocations.BlockGrid?.Any() == true)
                locations.AddRange(ViewLocations.BlockGrid);

            if (ViewLocations.BlockList?.Any() == true)
                locations.AddRange(ViewLocations.BlockList);

            if (ViewLocations.RichText?.Any() == true)
                locations.AddRange(ViewLocations.RichText);

            locations.Add(Constants.DefaultViewLocations.BlockGrid);
            locations.Add(Constants.DefaultViewLocations.BlockList);
            locations.Add(Constants.DefaultViewLocations.RichText);

            locations = locations.Distinct().ToList();

            return locations;
        }

        public BlockPreviewOptions()
        {
            ViewLocations = new ViewLocations();
        }
    }

    public class ViewLocations
    {
        public ViewLocations()
        {
            BlockList = new List<string>();
            BlockGrid = new List<string>();
            RichText = new List<string>();
        }

        public List<string> BlockList { get; set; }

        public List<string> BlockGrid { get; set; }

        public List<string> RichText { get; set; }
    }
}