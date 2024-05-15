import { ManifestGlobalContext } from '@umbraco-cms/backoffice/extension-registry';

const contexts: Array<ManifestGlobalContext> = [
  {
    type: 'globalContext',
    alias: 'BlockPreview.Context',
    name: 'BlockPreview context',
    js: () => import('./blockpreview.context.ts')
  }
]

export const manifests = [...contexts];