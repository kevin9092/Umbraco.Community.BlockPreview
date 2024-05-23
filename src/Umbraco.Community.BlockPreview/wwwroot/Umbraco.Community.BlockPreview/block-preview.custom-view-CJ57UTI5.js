import { UMB_BLOCK_GRID_ENTRY_CONTEXT as C } from "@umbraco-cms/backoffice/block-grid";
import { B as d } from "./index-D7HZhpx6.js";
import { html as E, unsafeHTML as f, css as k, state as h, property as T, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as y } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as P, UMB_PROPERTY_DATASET_CONTEXT as O } from "@umbraco-cms/backoffice/property";
import { UMB_WORKSPACE_CONTEXT as M } from "@umbraco-cms/backoffice/workspace";
var A = Object.defineProperty, B = Object.getOwnPropertyDescriptor, r = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? B(t, s) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (a = (i ? u(t, s, a) : u(a)) || a);
  return i && a && A(t, s, a), a;
}, m = (e, t, s) => {
  if (!t.has(e))
    throw TypeError("Cannot " + s);
}, c = (e, t, s) => (m(e, t, "read from private field"), s ? s.call(e) : t.get(e)), p = (e, t, s) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, s);
}, v = (e, t, s, i) => (m(e, t, "write to private field"), i ? i.call(e, s) : t.set(e, s), s), _, n;
const D = "block-preview", g = "Umbraco.BlockList";
let o = class extends y {
  constructor() {
    super(), p(this, _, void 0), p(this, n, void 0), this._htmlMarkup = "", this._documentUnique = "", this._blockEditorAlias = "", this._culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(d, (e) => {
      v(this, _, e);
    }), this.consumeContext(P, (e) => {
      this.observe(e.alias, (t) => {
        this._blockEditorAlias = t;
      });
    }), this.consumeContext(C, (e) => {
      v(this, n, e), this.observe(c(this, n).workspaceEditContentPath, (t) => {
        this._workspaceEditContentPath = t;
      }), this.observe(c(this, n).content, (t) => {
        const s = [t];
        this._value = { ...this._value, contentData: s };
      }), this.observe(c(this, n).settings, (t) => {
        if (t !== void 0) {
          const s = [t];
          this._value = { ...this._value, settingsData: s };
        }
      }), this.observe(c(this, n).layout, (t) => {
        const s = [t];
        this._value = { ...this._value, layout: { "Umbraco.BlockGrid": s } };
      });
    }), this.consumeContext(O, (e) => {
      this._culture = e.getVariantId().culture ?? void 0;
    }), this.consumeContext(M, (e) => {
      const t = e;
      this.observe(t.unique, (s) => {
        this._documentUnique = s;
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
    super.connectedCallback(), c(this, _) != null && this.value != null && (this._htmlMarkup = await c(this, _).previewGridMarkup(this._documentUnique, this._blockEditorAlias, this._culture, this.value));
  }
  render() {
    if (this._htmlMarkup !== "")
      return E`
                <a href=${this._workspaceEditContentPath}>
				    ${f(this._htmlMarkup)}
				</a>`;
  }
};
_ = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
o.styles = [
  k`
            a {
                display: contents;
                color: inherit;
            }
        `
];
r([
  h()
], o.prototype, "_htmlMarkup", 2);
r([
  h()
], o.prototype, "_documentUnique", 2);
r([
  h()
], o.prototype, "_blockEditorAlias", 2);
r([
  h()
], o.prototype, "_culture", 2);
r([
  h()
], o.prototype, "_workspaceEditContentPath", 2);
r([
  h()
], o.prototype, "_value", 2);
r([
  T({ attribute: !1 })
], o.prototype, "value", 1);
o = r([
  w(D)
], o);
const I = o;
export {
  o as BlockPreviewCustomView,
  g as UMB_BLOCK_LIST_PROPERTY_EDITOR_ALIAS,
  I as default
};
//# sourceMappingURL=block-preview.custom-view-CJ57UTI5.js.map
