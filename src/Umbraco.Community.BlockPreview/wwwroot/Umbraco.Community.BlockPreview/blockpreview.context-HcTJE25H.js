var v = (r, t, e) => {
  if (!t.has(r))
    throw TypeError("Cannot " + e);
};
var s = (r, t, e) => (v(r, t, "read from private field"), e ? e.call(r) : t.get(r)), m = (r, t, e) => {
  if (t.has(r))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(r) : t.set(r, e);
}, k = (r, t, e, i) => (v(r, t, "write to private field"), i ? i.call(r, e) : t.set(r, e), e);
import { UmbControllerBase as d } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { tryExecuteAndNotify as h } from "@umbraco-cms/backoffice/resources";
import { BlockPreviewService as M, OpenAPI as l } from "@api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UmbStringState as f } from "@umbraco-cms/backoffice/observable-api";
var n;
class y {
  constructor(t) {
    m(this, n, void 0);
    k(this, n, t);
  }
  async previewGridMarkup(t, e, i, a) {
    return await h(s(this, n), M.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageId: t, blockEditorAlias: e, culture: i, requestBody: a }));
  }
  async previewListMarkup(t, e, i, a) {
    return await h(s(this, n), M.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageId: t, blockEditorAlias: e, culture: i, requestBody: a }));
  }
}
n = new WeakMap();
var c;
class B extends d {
  constructor(e) {
    super(e);
    m(this, c, void 0);
    k(this, c, new y(this));
  }
  async previewGridMarkup(e, i, a, o) {
    return await s(this, c).previewGridMarkup(e, i, a, o);
  }
  async previewListMarkup(e, i, a, o) {
    return await s(this, c).previewListMarkup(e, i, a, o);
  }
}
c = new WeakMap();
var u, p;
class C extends d {
  constructor(e) {
    super(e);
    m(this, u, void 0);
    m(this, p, void 0);
    k(this, p, new f("")), this.markup = s(this, p).asObservable(), this.provideContext(L, this), k(this, u, new B(this)), this.consumeContext(E, (i) => {
      l.TOKEN = () => i.getLatestToken(), l.WITH_CREDENTIALS = !0;
    });
  }
  async previewGridMarkup(e, i, a, o) {
    const { data: w } = await s(this, u).previewGridMarkup(e, i, a, o);
    w && s(this, p).setValue(w);
  }
  async previewListMarkup(e, i, a, o) {
    const { data: w } = await s(this, u).previewListMarkup(e, i, a, o);
    w && s(this, p).setValue(w);
  }
}
u = new WeakMap(), p = new WeakMap();
const L = new T(C.name);
export {
  L as BLOCKPREVIEW_MANAGEMENT_CONTEXT_TOKEN,
  C as BlockPreviewManagementContext,
  C as default
};
//# sourceMappingURL=blockpreview.context-HcTJE25H.js.map
