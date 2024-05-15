import { ManifestElement } from "@umbraco-cms/backoffice/extension-api";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/extension-registry";

const blockEditorCustomView: ManifestElement<UmbPropertyEditorUiElement> = {
  type: 'blockEditorCustomView',
  alias: 'BlockPreview.CustomView',
  name: 'BlockPreview',
  element: () => import('./block-preview.custom-view.js')
}

export const manifests = [blockEditorCustomView];