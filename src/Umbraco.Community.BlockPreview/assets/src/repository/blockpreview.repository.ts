import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { BlockPreviewManagementDataSource } from "./sources/blockpreview.datasource";
import { UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";

export class BlockPreviewManagementRepository extends UmbControllerBase {
    #blockPreviewDataSource: BlockPreviewManagementDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#blockPreviewDataSource = new BlockPreviewManagementDataSource(this);
    }

    async previewGridMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: UmbBlockGridValueModel) {
        return await this.#blockPreviewDataSource.previewGridMarkup(pageKey, blockEditorAlias, culture, blockData);
    }

    async previewListMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: string) {
        return await this.#blockPreviewDataSource.previewListMarkup(pageKey, blockEditorAlias, culture, blockData);
    }

}