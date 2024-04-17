import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { BlockPreviewManagementDataSource } from "./sources/blockpreview.datasource";
import { BlockValueBlockGridLayoutItemModel, BlockValueBlockListLayoutItemModel } from "@api";

export class BlockPreviewManagementRepository extends UmbControllerBase {
  #blockPreviewDataSource: BlockPreviewManagementDataSource;

  constructor(host: UmbControllerHost) {
    super(host);
    this.#blockPreviewDataSource = new BlockPreviewManagementDataSource(this);
  }

  async previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockGridLayoutItemModel) {
    return await this.#blockPreviewDataSource.previewGridMarkup(pageId, blockEditorAlias, culture, requestBody);
  }

  async previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockValueBlockListLayoutItemModel) {
    return await this.#blockPreviewDataSource.previewListMarkup(pageId, blockEditorAlias, culture, requestBody);
  }

}