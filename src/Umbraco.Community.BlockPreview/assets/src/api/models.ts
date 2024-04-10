

export type BlockGridLayoutAreaItemModel = {
        key: string
items: Array<BlockGridLayoutItemModel>
    };

export type BlockGridLayoutItemModel = {
        contentUdi?: GuidUdiModel | StringUdiModel | UnknownTypeUdiModel | null
settingsUdi?: GuidUdiModel | StringUdiModel | UnknownTypeUdiModel | null
columnSpan?: number | null
rowSpan?: number | null
areas: Array<BlockGridLayoutAreaItemModel>
    };

export type BlockGridValueModel = BlockValueBlockGridLayoutItemModel;

export type BlockItemDataModel = {
        contentTypeKey: string
udi?: GuidUdiModel | StringUdiModel | UnknownTypeUdiModel | null
[key: string]: unknown | undefined
    };

export type BlockListLayoutItemModel = {
        contentUdi?: GuidUdiModel | StringUdiModel | UnknownTypeUdiModel | null
settingsUdi?: GuidUdiModel | StringUdiModel | UnknownTypeUdiModel | null
    };

export type BlockListValueModel = BlockValueBlockListLayoutItemModel;

export type BlockValueBlockGridLayoutItemModel = {
        layout: Record<string, Array<BlockGridLayoutItemModel>>
contentData: Array<BlockItemDataModel>
settingsData: Array<BlockItemDataModel>
    };

export type BlockValueBlockListLayoutItemModel = {
        layout: Record<string, Array<BlockListLayoutItemModel>>
contentData: Array<BlockItemDataModel>
settingsData: Array<BlockItemDataModel>
    };

export enum EventMessageTypeModel {
    DEFAULT = 'Default',
    INFO = 'Info',
    ERROR = 'Error',
    SUCCESS = 'Success',
    WARNING = 'Warning'
}

export type GuidUdiModel = (UdiModel & {
        guid: string
readonly isRoot: boolean
    });

export type NotificationHeaderModel = {
        message: string
category: string
type: EventMessageTypeModel
    };

export type StringUdiModel = (UdiModel & {
        id: string
readonly isRoot: boolean
    });

export type UdiModel = {
        readonly uriValue: string
readonly entityType: string
readonly isRoot: boolean
    };

export type UnknownTypeUdiModel = (UdiModel & {
        readonly isRoot: boolean
    });

export type BlockPreviewData = {
        
        payloads: {
            PostUmbracoBlockpreviewApiV1PreviewGridMarkup: {
                        blockEditorAlias?: string
culture?: string
pageId?: number
requestBody?: BlockGridValueModel
                        
                    };
PostUmbracoBlockpreviewApiV1PreviewListMarkup: {
                        blockEditorAlias?: string
culture?: string
pageId?: number
requestBody?: BlockListValueModel
                        
                    };
        }
        
        
        responses: {
            PostUmbracoBlockpreviewApiV1PreviewGridMarkup: string
                ,PostUmbracoBlockpreviewApiV1PreviewListMarkup: string
                
        }
        
    }