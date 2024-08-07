import { UMB_BLOCK_GRID_ENTRY_CONTEXT, UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/extension-registry";
import { css, customElement, html, ifDefined, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";
import { BlockPreviewService, PreviewGridMarkupData } from "../api";

const elementName = "block-grid-preview";

@customElement(elementName)
export class BlockGridPreviewCustomView
    extends UmbLitElement
    implements UmbBlockEditorCustomViewElement {

    @state()
    htmlMarkup: string | undefined = "";

    @state()
    documentUnique?: string = '';

    @state()
    blockEditorAlias?: string = '';

    @state()
    culture?: string = '';

    @state()
    workspaceEditContentPath?: string;

    @state()
    private _value: UmbBlockGridValueModel = {
        layout: {},
        contentData: [],
        settingsData: []
    }

    @property({ attribute: false })
    public set value(value: UmbBlockGridValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockGridValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        this._value = buildUpValue as UmbBlockGridValueModel;
    }
    public get value(): UmbBlockGridValueModel {
        return this._value;
    }

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
            this.observe(instance.alias, async (alias) => {
                this.blockEditorAlias = alias;
                await this.#renderBlockPreview();
            });
        })

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (instance) => {
            this.culture = instance.getVariantId().culture ?? "";
            await this.#renderBlockPreview();
        });

        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
            this.observe(context.unique, async (unique) => {
                this.documentUnique = unique;
                await this.#renderBlockPreview();
            });
        });

        this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.workspaceEditContentPath, context.content, context.settings, context.layout]),
                async ([workspaceEditContentPath, content, settings, layout]) => {
                    this.workspaceEditContentPath = workspaceEditContentPath;

                    this._value = {
                        ...this._value,
                        contentData: [content!],
                        settingsData: [settings!],
                        layout: { ["Umbraco.BlockGrid"]: [layout!] }
                    }

                    await this.#renderBlockPreview();
                },
                'renderBlockPreview',
            );
        });
    }  

    async #renderBlockPreview() {
        if (!this.documentUnique || !this.blockEditorAlias || !this.value.contentData || !this.value.layout) return;

        const previewData: PreviewGridMarkupData = { blockEditorAlias: this.blockEditorAlias, culture: this.culture, pageKey: this.documentUnique, requestBody: JSON.stringify(this.value) };

        const { data } = await tryExecuteAndNotify(this, BlockPreviewService.previewGridMarkup(previewData));

        if (data) this.htmlMarkup = data;
    }

    render() {
        if (this.htmlMarkup !== "") {
            return html`
                <a href=${ifDefined(this.workspaceEditContentPath)}>
                    ${unsafeHTML(this.htmlMarkup)}
                </a>`;
        }
        return;
    }

    static styles = [
        css`
            a {
              display: block;
              color: inherit;
              text-decoration: inherit;
              border: 1px solid transparent;
              border-radius: 2px;
            }

            a:hover {
                border-color: var(--uui-color-interactive-emphasis, #3544b1);
            }
        `
    ]
}

export default BlockGridPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockGridPreviewCustomView;
    }
}
