import { UmbBlockViewUrlsPropType } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT, UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";
import BlockPreviewContext, { BLOCK_PREVIEW_CONTEXT } from "../context/blockpreview.context";
import { UmbDocumentWorkspaceContext } from "@umbraco-cms/backoffice/document";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/extension-registry";
import { customElement, html, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { UMB_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { UmbBlockGridEntryContext } from "../../node_modules/@umbraco-cms/backoffice/dist-cms/packages/block/block-grid/context/block-grid-entry.context";

const elementName = "block-preview";
export const UMB_BLOCK_LIST_PROPERTY_EDITOR_ALIAS: string = 'Umbraco.BlockList';

@customElement(elementName)
export class BlockPreviewCustomView
    extends UmbLitElement
    implements UmbPropertyEditorUiElement {

    #blockPreviewContext?: BlockPreviewContext;
    #blockGridEntryContext?: UmbBlockGridEntryContext;

    @state()
    private _contentElementKey: string | undefined = undefined;

    @state()
    private _settingsElementKey: string | undefined = undefined;

    @state()
    _htmlMarkup: string | undefined = "";

    @state()
    private _documentUnique?: string = '';

    @state()
    private _blockEditorAlias?: string = '';

    @state()
    private _culture?: string = '';

    @property({ attribute: false })
    label?: string;

    @property({ attribute: false })
    urls?: UmbBlockViewUrlsPropType;

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

        this.consumeContext(BLOCK_PREVIEW_CONTEXT, (instance) => {
            this.#blockPreviewContext = instance;
        });

        this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
            this.observe(instance.alias, (alias) => {
                this._blockEditorAlias = alias;
            });
        })

        this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (instance) => {
            this.#blockGridEntryContext = instance;

            this.observe(this.#blockGridEntryContext.contentUdi, (contentUdi) => {
                this._contentElementKey = contentUdi;
            });

            this.observe(this.#blockGridEntryContext.content, (content) => {
                const contentArr = [content!];
                this._value = { ...this._value, contentData: contentArr };
            });

            this.observe(this.#blockGridEntryContext.settings, (settings) => {
                if (settings !== undefined) {
                    const settingsArr = [settings!];
                    this._value = { ...this._value, settingsData: settingsArr };
                }
            });

            this.observe(this.#blockGridEntryContext.layout, (layout) => {
                const layoutArr = [layout!];
                this._value = { ...this._value, layout: { ["Umbraco.BlockGrid"]: layoutArr } };
            });
        });

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {
            this._culture = instance.getVariantId().culture ?? undefined;
        });

        this.consumeContext(UMB_WORKSPACE_CONTEXT, (nodeContext) => {
            const workspaceContext = (nodeContext as UmbDocumentWorkspaceContext);
            
            this.observe((workspaceContext).unique, (unique) => {
                this._documentUnique = unique;
            });
        });
    }

    async connectedCallback() {
        super.connectedCallback();

        if (this.#blockPreviewContext != null && this.value != null) {
            this._htmlMarkup = await this.#blockPreviewContext.previewGridMarkup(this._documentUnique, this._blockEditorAlias, this._culture, this.value);
        }
    }

    render() {
        if (this._htmlMarkup !== "") {
            return html`${unsafeHTML(this._htmlMarkup)}`;
        }
        return;
    }
}

export default BlockPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockPreviewCustomView;
    }
}
