import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

import { BlockPreviewManagementRepository as BlockPreviewRepository } from "../repository/blockpreview.repository";

import { UmbStringState } from "@umbraco-cms/backoffice/observable-api";
import { UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";

export class BlockPreviewContext extends UmbControllerBase {

    #repository: BlockPreviewRepository;

    #markup = new UmbStringState("");
    public readonly markup = this.#markup.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);
        this.#repository = new BlockPreviewRepository(this);
    }

    async previewGridMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: UmbBlockGridValueModel): Promise<string> {
        const { data } = await this.#repository.previewGridMarkup(pageKey, blockEditorAlias, culture, blockData);
        if (data) {
            return data;
        }

        return '';
    }

    async previewListMarkup(pageKey?: string, blockEditorAlias?: string, culture?: string, blockData?: string): Promise<string> {
        const { data } = await this.#repository.previewListMarkup(pageKey, blockEditorAlias, culture, blockData);
        if (data) {
            return data;
        }

        return '';
    }

}

export default BlockPreviewContext;

export const BLOCK_PREVIEW_CONTEXT =
    new UmbContextToken<BlockPreviewContext>('BlockPreviewContext');