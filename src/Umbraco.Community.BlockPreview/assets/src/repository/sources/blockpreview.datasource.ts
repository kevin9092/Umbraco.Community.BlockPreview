import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDataSourceResponse } from "@umbraco-cms/backoffice/repository";
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { BlockPreviewService } from '../../api';
import { UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";

export interface BlockPreviewDataSource {

    previewGridMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: UmbBlockGridValueModel): Promise<UmbDataSourceResponse<string>>;
    previewListMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: string): Promise<UmbDataSourceResponse<string>>;

}

export class BlockPreviewManagementDataSource implements BlockPreviewDataSource {

    #host: UmbControllerHost;

    constructor(host: UmbControllerHost) {
        this.#host = host;
    }

    async previewGridMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: UmbBlockGridValueModel): Promise<UmbDataSourceResponse<string>> {
        return await tryExecuteAndNotify(this.#host, BlockPreviewService.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageKey, blockEditorAlias, culture, requestBody: JSON.stringify(blockData) }));
    }

    async previewListMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: string): Promise<UmbDataSourceResponse<string>> {
        return await tryExecuteAndNotify(this.#host, BlockPreviewService.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageKey, blockEditorAlias, culture, requestBody: blockData }));
    }

}