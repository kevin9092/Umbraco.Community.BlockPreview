import { UMB_BLOCK_GRID_ENTRY_CONTEXT as m } from "@umbraco-cms/backoffice/block-grid";
import { html as C, ifDefined as E, unsafeHTML as f, css as k, state as h, property as T, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as y } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as P, UMB_PROPERTY_DATASET_CONTEXT as O } from "@umbraco-cms/backoffice/property";
import { UMB_WORKSPACE_CONTEXT as M } from "@umbraco-cms/backoffice/workspace";
import { B as x } from "./index-DcBZRxtI.js";
var A = Object.defineProperty, B = Object.getOwnPropertyDescriptor, s = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? B(t, r) : t, _ = e.length - 1, u; _ >= 0; _--)
    (u = e[_]) && (a = (i ? u(t, r, a) : u(a)) || a);
  return i && a && A(t, r, a), a;
}, d = (e, t, r) => {
  if (!t.has(e))
    throw TypeError("Cannot " + r);
}, c = (e, t, r) => (d(e, t, "read from private field"), r ? r.call(e) : t.get(e)), p = (e, t, r) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, r);
}, v = (e, t, r, i) => (d(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r), l, n;
const b = "block-preview", I = "Umbraco.BlockList";
let o = class extends y {
  constructor() {
    super(), p(this, l, void 0), p(this, n, void 0), this._htmlMarkup = "", this._documentUnique = "", this._blockEditorAlias = "", this._culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(x, (e) => {
      v(this, l, e);
    }), this.consumeContext(P, (e) => {
      this.observe(e.alias, (t) => {
        this._blockEditorAlias = t;
      });
    }), this.consumeContext(m, (e) => {
      v(this, n, e);
      debugger;
      this.observe(c(this, n).workspaceEditContentPath, (t) => {
        this._workspaceEditContentPath = t;
      }), this.observe(c(this, n).content, (t) => {
        const r = [t];
        this._value = { ...this._value, contentData: r };
      }), this.observe(c(this, n).settings, (t) => {
        if (t !== void 0) {
          const r = [t];
          this._value = { ...this._value, settingsData: r };
        }
      }), this.observe(c(this, n).layout, (t) => {
        const r = [t];
        this._value = { ...this._value, layout: { "Umbraco.BlockGrid": r } };
      });
    }), this.consumeContext(O, (e) => {
      this._culture = e.getVariantId().culture ?? void 0;
    }), this.consumeContext(M, (e) => {
      const t = e;
      this.observe(t.unique, (r) => {
        this._documentUnique = r;
      });
    });
  }
  set value(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), this._value = t;
  }
  get value() {
    return this._value;
  }
  async connectedCallback() {
    super.connectedCallback(), c(this, l) != null && this.value != null && (this._htmlMarkup = await c(this, l).previewGridMarkup(this._documentUnique, this._blockEditorAlias, this._culture, this.value));
  }
  render() {
    if (this._htmlMarkup !== "")
      return C`
                <a href=${E(this._workspaceEditContentPath)}>
                    ${f(this._htmlMarkup)}
                </a>`;
  }
};
l = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
o.styles = [
  k`
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
];
s([
  h()
], o.prototype, "_htmlMarkup", 2);
s([
  h()
], o.prototype, "_documentUnique", 2);
s([
  h()
], o.prototype, "_blockEditorAlias", 2);
s([
  h()
], o.prototype, "_culture", 2);
s([
  h()
], o.prototype, "_workspaceEditContentPath", 2);
s([
  h()
], o.prototype, "_value", 2);
s([
  T({ attribute: !1 })
], o.prototype, "value", 1);
o = s([
  w(b)
], o);
const S = o;
export {
  o as BlockPreviewCustomView,
  I as UMB_BLOCK_LIST_PROPERTY_EDITOR_ALIAS,
  S as default
};
//# sourceMappingURL=block-preview.custom-view-CSs5XMw7.js.map
