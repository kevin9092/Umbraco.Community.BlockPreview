import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ManifestBlockEditorCustomView } from '@umbraco-cms/backoffice/extension-registry';

export * from './repository';
export * from './blockEditor';

import { SettingsRepository } from './repository';
import { BlockGridPreviewCustomView } from './blockEditor/block-grid-preview.custom-view.element.ts';
import { BlockListPreviewCustomView } from './blockEditor/block-list-preview.custom-view.element.ts';
import { OpenAPI } from './api/index.ts';

export const onInit: UmbEntryPointOnInit = async (host, extensionRegistry) => {

    const settingsRepository = new SettingsRepository(host);
    const settings = await settingsRepository.getSettings();

    let customViewManifests: ManifestBlockEditorCustomView[] = [];

    if (settings) {
        if (settings.blockGrid.enabled) {
            let blockGridManifest: ManifestBlockEditorCustomView = {
                type: 'blockEditorCustomView',
                alias: 'BlockPreview.GridCustomView',
                name: 'BlockPreview Grid Custom View',
                element: BlockGridPreviewCustomView,
                forBlockEditor: 'block-grid'
            };

            if (settings.blockGrid.contentTypes?.length !== 0) {
                blockGridManifest.forContentTypeAlias = settings.blockGrid.contentTypes as string[];
            }

            customViewManifests.push(blockGridManifest);
        }

        if (settings.blockList.enabled) {
            let blockListManifest: ManifestBlockEditorCustomView = {
                type: 'blockEditorCustomView',
                alias: 'BlockPreview.ListCustomView',
                name: 'BlockPreview List Custom View',
                element: BlockListPreviewCustomView,
                forBlockEditor: 'block-list'
            };

            if (settings.blockList.contentTypes?.length !== 0) {
                blockListManifest.forContentTypeAlias = settings.blockList.contentTypes as string[];
            }

            customViewManifests.push(blockListManifest);
        }
    }

    extensionRegistry.registerMany([
        ...customViewManifests
    ]);

    host.consumeContext(UMB_AUTH_CONTEXT, async (auth) => {
        if (!auth) return;

        const umbOpenApi = auth.getOpenApiConfiguration();
        OpenAPI.BASE = umbOpenApi.base;
        OpenAPI.TOKEN = umbOpenApi.token;
        OpenAPI.WITH_CREDENTIALS = umbOpenApi.withCredentials;
        OpenAPI.CREDENTIALS = umbOpenApi.credentials;
    });
};