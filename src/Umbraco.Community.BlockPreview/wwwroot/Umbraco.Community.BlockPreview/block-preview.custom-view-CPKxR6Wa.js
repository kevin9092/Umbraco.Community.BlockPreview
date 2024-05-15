import { UMB_BLOCK_GRID_ENTRY_CONTEXT as d } from "@umbraco-cms/backoffice/block-grid";
import { B as f } from "./index--w7AJsPr.js";
import { html as y, unsafeHTML as C, state as l, property as p, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as k } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as O, UMB_PROPERTY_DATASET_CONTEXT as w } from "@umbraco-cms/backoffice/property";
import { UMB_WORKSPACE_CONTEXT as P } from "@umbraco-cms/backoffice/workspace";
var M = Object.defineProperty, A = Object.getOwnPropertyDescriptor, r = (e, t, o, i) => {
  for (var a = i > 1 ? void 0 : i ? A(t, o) : t, h = e.length - 1, u; h >= 0; h--)
    (u = e[h]) && (a = (i ? u(t, o, a) : u(a)) || a);
  return i && a && M(t, o, a), a;
}, E = (e, t, o) => {
  if (!t.has(e))
    throw TypeError("Cannot " + o);
}, _ = (e, t, o) => (E(e, t, "read from private field"), o ? o.call(e) : t.get(e)), v = (e, t, o) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, o);
}, m = (e, t, o, i) => (E(e, t, "write to private field"), i ? i.call(e, o) : t.set(e, o), o), c, n;
const B = "block-preview", L = "Umbraco.BlockList";
let s = class extends k {
  constructor() {
    super(), v(this, c, void 0), v(this, n, void 0), this._contentElementKey = void 0, this._settingsElementKey = void 0, this._htmlMarkup = "", this._documentUnique = "", this._blockEditorAlias = "", this._culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(f, (e) => {
      m(this, c, e);
    }), this.consumeContext(O, (e) => {
      this.observe(e.alias, (t) => {
        this._blockEditorAlias = t;
      });
    }), this.consumeContext(d, (e) => {
      m(this, n, e), this.observe(_(this, n).contentUdi, (t) => {
        this._contentElementKey = t;
      }), this.observe(_(this, n).content, (t) => {
        const o = [t];
        this._value = { ...this._value, contentData: o };
      }), this.observe(_(this, n).settings, (t) => {
        if (t !== void 0) {
          const o = [t];
          this._value = { ...this._value, settingsData: o };
        }
      }), this.observe(_(this, n).layout, (t) => {
        const o = [t];
        this._value = { ...this._value, layout: { "Umbraco.BlockGrid": o } };
      });
    }), this.consumeContext(w, (e) => {
      this._culture = e.getVariantId().culture ?? void 0;
    }), this.consumeContext(P, (e) => {
      const t = e;
      this.observe(t.unique, (o) => {
        this._documentUnique = o;
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
    super.connectedCallback(), _(this, c) != null && this.value != null && (this._htmlMarkup = await _(this, c).previewGridMarkup(this._documentUnique, this._blockEditorAlias, this._culture, this.value));
  }
  render() {
    if (this._htmlMarkup !== "")
      return y`${C(this._htmlMarkup)}`;
  }
};
c = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
r([
  l()
], s.prototype, "_contentElementKey", 2);
r([
  l()
], s.prototype, "_settingsElementKey", 2);
r([
  l()
], s.prototype, "_htmlMarkup", 2);
r([
  l()
], s.prototype, "_documentUnique", 2);
r([
  l()
], s.prototype, "_blockEditorAlias", 2);
r([
  l()
], s.prototype, "_culture", 2);
r([
  p({ attribute: !1 })
], s.prototype, "label", 2);
r([
  p({ attribute: !1 })
], s.prototype, "urls", 2);
r([
  l()
], s.prototype, "_value", 2);
r([
  p({ attribute: !1 })
], s.prototype, "value", 1);
s = r([
  T(B)
], s);
const U = s;
export {
  s as BlockPreviewCustomView,
  L as UMB_BLOCK_LIST_PROPERTY_EDITOR_ALIAS,
  U as default
};
//# sourceMappingURL=block-preview.custom-view-CPKxR6Wa.js.map
