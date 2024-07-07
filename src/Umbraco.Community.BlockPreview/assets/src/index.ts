import { UUIModalSidebarSize } from '@umbraco-cms/backoffice/external/uui';
import { ManifestElement, UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { OpenAPI } from './api';

export * from './repository';
export * from './blockEditor';

import { SettingsRepository } from './repository';
import BlockGridPreviewCustomView from './blockEditor/block-grid-preview.custom-view.element.ts';
import BlockListPreviewCustomView from './blockEditor/block-list-preview.custom-view.element.ts';

export const onInit: UmbEntryPointOnInit = async (host, extensionRegistry) => {
    
    const settingsRepository = new SettingsRepository(host);
    const settings = await settingsRepository.getSettings();

    let customViewManifests: ManifestBlockEditorCustomView[] = [];

    if (settings) {
        if (settings.blockGrid.enabled) {
            customViewManifests.push({
                type: 'blockEditorCustomView',
                alias: 'BlockPreview.GridCustomView',
                name: 'BlockPreview Grid Custom View',
                element: BlockGridPreviewCustomView,
                forContentTypeAlias: settings.blockGrid.contentTypes ?? [],
                forBlockEditor: 'block-grid'
            });
        }

        if (settings.blockList.enabled) {
            customViewManifests.push({
                type: 'blockEditorCustomView',
                alias: 'BlockPreview.ListCustomView',
                name: 'BlockPreview List Custom View',
                element: BlockListPreviewCustomView,
                forContentTypeAlias: settings.blockList.contentTypes ?? [],
                forBlockEditor: 'block-grid'
            });
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


export interface ManifestBlockEditorCustomView extends ManifestElement<UmbBlockEditorCustomViewElement> {
    type: 'blockEditorCustomView';
    /**
     * @property {string | Array<string> } - Declare if this Custom View only must appear at specific Content Types by Alias.
     * @description Optional condition if you like this custom view to only appear at for one or more specific Content Types.
     * @example 'my-element-type-alias'
     * @example ['my-element-type-alias-A', 'my-element-type-alias-B']
     */
    forContentTypeAlias?: string | Array<string>;
    /**
     * @property {string | Array<string> } - Declare if this Custom View only must appear at specific Block Editors.
     * @description Optional condition if you like this custom view to only appear at a specific type of Block Editor.
     * @example 'block-list'
     * @example ['block-list', 'block-grid']
     */
    forBlockEditor?: string | Array<string>;
}


// Shared with the Property Editor
export interface UmbBlockTypeBaseModel {
    contentElementTypeKey: string;
    settingsElementTypeKey?: string;
    label?: string;
    thumbnail?: string;
    iconColor?: string;
    backgroundColor?: string;
    editorSize?: UUIModalSidebarSize;
    forceHideContentEditorInOverlay: boolean;
}

// Shared with the Property Editor
export interface UmbBlockLayoutBaseModel {
    contentUdi: string;
    settingsUdi?: string | null;
}

// Shared with the Property Editor
export interface UmbBlockDataType {
    udi: string;
    contentTypeKey: string;
    [key: string]: unknown;
}

export interface UmbBlockEditorCustomViewConfiguration {
    editContentPath?: string;
    editSettingsPath?: string;
    showContentEdit: boolean;
    showSettingsEdit: boolean;
}


export interface UmbBlockEditorCustomViewProperties<LayoutType extends UmbBlockLayoutBaseModel = UmbBlockLayoutBaseModel, BlockType extends UmbBlockTypeBaseModel = UmbBlockTypeBaseModel> {
    manifest?: ManifestBlockEditorCustomView;
    config?: Partial<UmbBlockEditorCustomViewConfiguration>;
    blockType?: BlockType;
    contentUdi?: string;
    label?: string;
    icon?: string;
    index?: number;
    layout?: LayoutType;
    content?: UmbBlockDataType;
    settings?: UmbBlockDataType;
}

export interface UmbBlockEditorCustomViewElement<LayoutType extends UmbBlockLayoutBaseModel = UmbBlockLayoutBaseModel, BlockType extends UmbBlockTypeBaseModel = UmbBlockTypeBaseModel> extends UmbBlockEditorCustomViewProperties<LayoutType, BlockType>, HTMLElement {

}
