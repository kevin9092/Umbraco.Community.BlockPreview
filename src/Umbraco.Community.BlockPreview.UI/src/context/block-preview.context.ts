import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { SettingsRepository } from "..";
import { UmbObjectState } from "@umbraco-cms/backoffice/observable-api";
import { BlockPreviewOptions } from "../api";

export class BlockPreviewContext extends UmbControllerBase {

    #settingsRepository: SettingsRepository;

    #settings = new UmbObjectState<BlockPreviewOptions | undefined>(undefined);
    public readonly settings = this.#settings.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);
        this.#settingsRepository = new SettingsRepository(host);

        this.getSettings();
    }

    async getSettings() {
        const settings = await this.#settingsRepository.getSettings();
        this.#settings.setValue(settings);
    }
}

export default BlockPreviewContext;