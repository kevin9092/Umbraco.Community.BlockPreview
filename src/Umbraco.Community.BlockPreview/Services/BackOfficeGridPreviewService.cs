using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeGridPreviewService : BackOfficePreviewServiceBase, IBackOfficeGridPreviewService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ContextCultureService _contextCultureService;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly IDataTypeService _dataTypeService;
        private readonly IContentTypeService _contentTypeService;

        public BackOfficeGridPreviewService(
            BlockEditorConverter blockEditorConverter,
            ContextCultureService contextCultureService,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IOptions<BlockPreviewOptions> options,
            IRazorViewEngine razorViewEngine,
            IJsonSerializer jsonSerializer,
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            IMemoryCache memoryCache)
            : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine, typeFinder, blockEditorConverter, viewComponentSelector, publishedValueFallback, options)
        {
            _contextCultureService = contextCultureService;
            _jsonSerializer = jsonSerializer;
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
            _memoryCache = memoryCache;
        }

        public override async Task<string> GetMarkupForBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            if (blockData == null)
                return string.Empty;

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Empty;

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Empty;

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockData.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            BlockGridItem? blockInstance = CreateBlockInstance(
                isGrid: true, isRte: false,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as BlockGridItem;

            if (blockInstance == null)
                return string.Empty;

            string? layoutItemJson = blockData?.Layout?.FirstOrDefault().Value.FirstOrDefault()!.ToString();
            BlockGridLayoutItem? layoutItem = null;

            if (!string.IsNullOrEmpty(layoutItemJson))
            {
                layoutItem = JsonConvert.DeserializeObject<BlockGridLayoutItem>(layoutItemJson);
                if (layoutItem != null)
                {
                    blockInstance.RowSpan = layoutItem.RowSpan!.Value;
                    blockInstance.ColumnSpan = layoutItem.ColumnSpan!.Value;
                }
            }

            IContentType? documentType = _contentTypeService.Get(documentTypeUnique);            
            if (documentType == null)
                return string.Empty;

            IPropertyType? property = documentType.PropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));            
            if (property == null)
                return string.Empty;

            IDataType? dataType = _dataTypeService.GetAll(property.DataTypeId).FirstOrDefault();
            if (dataType == null)
                return string.Empty;

            BlockGridConfiguration? config = dataType.ConfigurationAs<BlockGridConfiguration>();
            if (config == null)
                return string.Empty;

            BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlock = config.Blocks.FirstOrDefault(x => x.ContentElementTypeKey == contentData.ContentTypeKey);
            if (matchingBlock == null)
                return string.Empty;

            ConfigureBlockInstanceAreas(blockInstance, config, matchingBlock, layoutItem!, blockData!);

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData);
        }

        private void ConfigureBlockInstanceAreas(
            BlockGridItem blockInstance,
            BlockGridConfiguration config,
            BlockGridConfiguration.BlockGridBlockConfiguration matchingBlock,
            BlockGridLayoutItem layoutItem,
            BlockValue blockValue)
        {
            blockInstance.AreaGridColumns = matchingBlock.AreaGridColumns ?? 12;
            blockInstance.GridColumns = config.GridColumns ?? 12;

            var blockConfigAreaMap = matchingBlock.Areas.ToDictionary(area => area.Key);
            if (layoutItem == null || blockConfigAreaMap == null || !blockConfigAreaMap.Any())
                return;

            blockInstance.Areas = layoutItem.Areas.Select(area =>
            {
                if (!blockConfigAreaMap.TryGetValue(area.Key, out var areaConfig))
                    return null;

                var items = area.Items.Select(item =>
                {
                    BlockItemData? areaContentData = blockValue.ContentData.FirstOrDefault(x => x.Udi == item.ContentUdi);
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, true);

                    BlockItemData? areaSettingsData = blockValue.SettingsData.FirstOrDefault(x => x.Udi == item.SettingsUdi);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, true) : default;

                    return new BlockGridItem(item.ContentUdi!, areaContentElement!, item.SettingsUdi!, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(items, areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToList();
        }

        public override ViewDataDictionary CreateViewData(object? typedBlockInstance)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;
            viewData["blockGridPreview"] = true;
            return viewData;
        }
    }
}