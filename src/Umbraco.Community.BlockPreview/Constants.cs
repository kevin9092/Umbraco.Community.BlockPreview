﻿namespace Umbraco.Community.BlockPreview
{
    public static partial class Constants
    {
        public static partial class DefaultViewLocations
        {
            public static string BlockGrid => "/Views/Partials/blockgrid/Components/{0}.cshtml";
            public static string BlockList => "/Views/Partials/blocklist/Components/{0}.cshtml";
            public static string RichText => "/Views/Partials/richtext/Components/{0}.cshtml";
        }

        public static partial class Configuration
        {
            public static string PackageName => "Umbraco.Community.BlockPreview";
            public static string AppSettingsRoot => "BlockPreview";
            public static string AppPluginsRoot => $"App_Plugins/{PackageName}";
        }
    }
}