import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { OpenAPI } from './api/index.ts';

import BlockPreviewContext, { BLOCK_PREVIEW_CONTEXT } from './context/blockpreview.context.ts';

import { manifests as contextManifests } from './context/manifest.ts';
import { manifests as blockEditorManifests } from './blockEditor/manifests.ts';

export const onInit: UmbEntryPointOnInit = (host, extensionRegistry) => {

  extensionRegistry.registerMany([
    ...contextManifests,
    ...blockEditorManifests
  ]);

  host.consumeContext(UMB_AUTH_CONTEXT, async (auth) => {
    if (!auth) return;

    const umbOpenApi = auth.getOpenApiConfiguration();
    OpenAPI.BASE = umbOpenApi.base;
    OpenAPI.TOKEN = umbOpenApi.token;
    OpenAPI.WITH_CREDENTIALS = umbOpenApi.withCredentials;
    OpenAPI.CREDENTIALS = umbOpenApi.credentials;
  });

  host.provideContext(BLOCK_PREVIEW_CONTEXT, new BlockPreviewContext(host));
};
