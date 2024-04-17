import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDataSourceResponse } from "@umbraco-cms/backoffice/repository";
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { BlockPreviewService, type BlockValueBlockGridLayoutItemModel, type BlockValueBlockListLayoutItemModel } from '@api';

export interface BlockPreviewDataSource {

  previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockGridLayoutItemModel): Promise<UmbDataSourceResponse<string>>;
  previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockListLayoutItemModel): Promise<UmbDataSourceResponse<string>>;

}

export class BlockPreviewManagementDataSource implements BlockPreviewDataSource {

  #host: UmbControllerHost;

  constructor(host: UmbControllerHost) {
    this.#host = host;
  }

  async previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockGridLayoutItemModel): Promise<UmbDataSourceResponse<string>> {
    return await tryExecuteAndNotify(this.#host, BlockPreviewService.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageId, blockEditorAlias, culture, requestBody }));
  }

  async previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockListLayoutItemModel): Promise<UmbDataSourceResponse<string>> {
    return await tryExecuteAndNotify(this.#host, BlockPreviewService.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageId, blockEditorAlias, culture, requestBody }));
  }

 }