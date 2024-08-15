using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public ViewLocations ViewLocations { get; set; }

        public List<string>? GetViewLocations(BlockType blockType)
        {
            var locations = new List<string>();

            if (blockType == BlockType.BlockGrid)
            {
                if (ViewLocations.BlockGrid?.Any() == true)
                    locations.AddRange(ViewLocations.BlockGrid);

                locations.Add(Constants.DefaultViewLocations.BlockGrid);
            }

            if (blockType == BlockType.BlockList)
            {
                if (ViewLocations.BlockList?.Any() == true)
                    locations.AddRange(ViewLocations.BlockList);

                locations.Add(Constants.DefaultViewLocations.BlockList);
            }

            if (blockType == BlockType.RichText)
            {
                if (ViewLocations.RichText?.Any() == true)
                    locations.AddRange(ViewLocations.RichText);

                locations.Add(Constants.DefaultViewLocations.RichText);
            }

            locations = locations.Distinct().ToList();

            return locations;
        }

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