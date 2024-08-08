import { UmbDataSourceResponse } from "@umbraco-cms/backoffice/repository";
import { BlockPreviewService, type BlockPreviewOptions } from "../api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";

export interface ISettingsDataSource {
    getSettings(): Promise<UmbDataSourceResponse<BlockPreviewOptions>>
}

export class SettingsDataSource implements ISettingsDataSource {
    #host: UmbControllerHost;

    constructor(host: UmbControllerHost) {
        this.#host = host;
    }

    async getSettings(): Promise<UmbDataSourceResponse<BlockPreviewOptions>> {
        return await tryExecuteAndNotify(this.#host, BlockPreviewService.getSettings());
    }
}