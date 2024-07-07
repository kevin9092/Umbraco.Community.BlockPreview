var q = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var T = (t, e, r) => (q(t, e, "read from private field"), r ? r.call(t) : e.get(t)), k = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, A = (t, e, r, s) => (q(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as Z } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as P } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as ee } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as te } from "@umbraco-cms/backoffice/block-grid";
import { css as U, state as l, property as I, customElement as $, html as j, ifDefined as H, unsafeHTML as G } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as V } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as K, UMB_PROPERTY_DATASET_CONTEXT as F } from "@umbraco-cms/backoffice/property";
import { UMB_WORKSPACE_CONTEXT as W } from "@umbraco-cms/backoffice/workspace";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as re } from "@umbraco-cms/backoffice/block-list";
class M extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class se extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class ie {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const i = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, o = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(a));
      }, n = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(a);
      };
      return Object.defineProperty(n, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(n, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(n, "isCancelled", {
        get: () => this._isCancelled
      }), e(i, o, n);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return this.promise.then(e, r);
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const e of this.cancelHandlers)
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new se("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class L {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const r = this._fns.indexOf(e);
    r !== -1 && (this._fns = [...this._fns.slice(0, r), ...this._fns.slice(r + 1)]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const _ = {
  BASE: "",
  CREDENTIALS: "include",
  ENCODE_PATH: void 0,
  HEADERS: void 0,
  PASSWORD: void 0,
  TOKEN: void 0,
  USERNAME: void 0,
  VERSION: "Latest",
  WITH_CREDENTIALS: !1,
  interceptors: {
    request: new L(),
    response: new L()
  }
}, b = (t) => typeof t == "string", R = (t) => b(t) && t !== "", O = (t) => t instanceof Blob, J = (t) => t instanceof FormData, oe = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ne = (t) => {
  const e = [], r = (i, o) => {
    e.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(o))}`);
  }, s = (i, o) => {
    o != null && (o instanceof Date ? r(i, o.toISOString()) : Array.isArray(o) ? o.forEach((n) => s(i, n)) : typeof o == "object" ? Object.entries(o).forEach(([n, a]) => s(`${i}[${n}]`, a)) : r(i, o));
  };
  return Object.entries(t).forEach(([i, o]) => s(i, o)), e.length ? `?${e.join("&")}` : "";
}, ae = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : o;
  }), i = t.BASE + s;
  return e.query ? i + ne(e.query) : i;
}, ce = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, i) => {
      b(i) || O(i) ? e.append(s, i) : e.append(s, JSON.stringify(i));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, i]) => {
      Array.isArray(i) ? i.forEach((o) => r(s, o)) : r(s, i);
    }), e;
  }
}, E = async (t, e) => typeof e == "function" ? e(t) : e, le = async (t, e) => {
  const [r, s, i, o] = await Promise.all([
    // @ts-ignore
    E(e, t.TOKEN),
    // @ts-ignore
    E(e, t.USERNAME),
    // @ts-ignore
    E(e, t.PASSWORD),
    // @ts-ignore
    E(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [h, c]) => ({
    ...a,
    [h]: String(c)
  }), {});
  if (R(r) && (n.Authorization = `Bearer ${r}`), R(s) && R(i)) {
    const a = oe(`${s}:${i}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : O(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : b(e.body) ? n["Content-Type"] = "text/plain" : J(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, ue = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : b(t.body) || O(t.body) || J(t.body) ? t.body : JSON.stringify(t.body);
}, de = async (t, e, r, s, i, o, n) => {
  const a = new AbortController();
  let h = {
    headers: o,
    body: s ?? i,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (h.credentials = t.CREDENTIALS);
  for (const c of t.interceptors.request._fns)
    h = await c(h);
  return n(() => a.abort()), await fetch(r, h);
}, he = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (b(r))
      return r;
  }
}, pe = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((s) => e.includes(s)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, fe = (t, e) => {
  const s = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "Im a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    ...t.errors
  }[e.status];
  if (s)
    throw new M(t, e, s);
  if (!e.ok) {
    const i = e.status ?? "unknown", o = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new M(
      t,
      e,
      `Generic Error: status: ${i}; status text: ${o}; body: ${n}`
    );
  }
}, S = (t, e) => new ie(async (r, s, i) => {
  try {
    const o = ae(t, e), n = ce(e), a = ue(e), h = await le(t, e);
    if (!i.isCancelled) {
      let c = await de(t, e, o, a, n, h, i);
      for (const Q of t.interceptors.response._fns)
        c = await Q(c);
      const D = await pe(c), Y = he(c, e.responseHeader);
      let x = D;
      e.responseTransformer && c.ok && (x = await e.responseTransformer(D));
      const N = {
        url: o,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: Y ?? x
      };
      fe(e, N), r(N.body);
    }
  } catch (o) {
    s(o);
  }
});
class B {
  /**
   * @param data The data for the request.
   * @param data.pageKey
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static postUmbracoManagementApiV1BlockPreviewPreviewGrid(e = {}) {
    return S(_, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        pageKey: e.pageKey,
        blockEditorAlias: e.blockEditorAlias,
        culture: e.culture
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.pageKey
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static postUmbracoManagementApiV1BlockPreviewPreviewList(e = {}) {
    return S(_, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
      query: {
        pageKey: e.pageKey,
        blockEditorAlias: e.blockEditorAlias,
        culture: e.culture
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getUmbracoManagementApiV1BlockPreviewSettings() {
    return S(_, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var v;
class ye {
  constructor(e) {
    k(this, v, void 0);
    A(this, v, e);
  }
  async getSettings() {
    return await P(T(this, v), B.getUmbracoManagementApiV1BlockPreviewSettings());
  }
}
v = new WeakMap();
var w;
class me extends ee {
  constructor(r) {
    super(r);
    k(this, w, void 0);
    A(this, w, new ye(r));
  }
  async getSettings() {
    const r = await T(this, w).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
w = new WeakMap();
var _e = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, p = (t, e, r, s) => {
  for (var i = s > 1 ? void 0 : s ? ve(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (s ? n(e, r, i) : n(i)) || i);
  return s && i && _e(e, r, i), i;
}, X = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, C = (t, e, r) => (X(t, e, "read from private field"), r ? r.call(t) : e.get(t)), we = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, be = (t, e, r, s) => (X(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r), y;
const Ee = "block-grid-preview";
let u = class extends V {
  constructor() {
    super(), we(this, y, void 0), this._htmlMarkup = "", this.documentUnique = "", this._blockEditorAlias = "", this.culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(K, (t) => {
      this.observe(t.alias, (e) => {
        this._blockEditorAlias = e;
      });
    }), this.consumeContext(te, (t) => {
      be(this, y, t), this.observe(C(this, y).workspaceEditContentPath, (e) => {
        this._workspaceEditContentPath = e;
      }), this.observe(C(this, y).content, (e) => {
        const r = [e];
        this._value = { ...this._value, contentData: r };
      }), this.observe(C(this, y).settings, (e) => {
        if (e !== void 0) {
          const r = [e];
          this._value = { ...this._value, settingsData: r };
        }
      }), this.observe(C(this, y).layout, (e) => {
        const r = [e];
        this._value = { ...this._value, layout: { "Umbraco.BlockGrid": r } };
      });
    }), this.consumeContext(F, (t) => {
      this.culture = t.getVariantId().culture ?? void 0;
    }), this.consumeContext(W, (t) => {
      const e = t;
      this.observe(e.unique, (r) => {
        this.documentUnique = r;
      });
    });
  }
  set value(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._value = e;
  }
  get value() {
    return this._value;
  }
  async connectedCallback() {
    if (super.connectedCallback(), this.value != null) {
      const { data: t } = await P(this, B.postUmbracoManagementApiV1BlockPreviewPreviewGrid({ blockEditorAlias: this._blockEditorAlias, culture: this.culture, pageKey: this.documentUnique, requestBody: JSON.stringify(this.value) }));
      t && (this._htmlMarkup = t);
    }
  }
  render() {
    if (this._htmlMarkup !== "")
      return j`
                <a href=${H(this._workspaceEditContentPath)}>
                    ${G(this._htmlMarkup)}
                </a>`;
  }
};
y = /* @__PURE__ */ new WeakMap();
u.styles = [
  U`
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
p([
  l()
], u.prototype, "_htmlMarkup", 2);
p([
  l()
], u.prototype, "documentUnique", 2);
p([
  l()
], u.prototype, "_blockEditorAlias", 2);
p([
  l()
], u.prototype, "culture", 2);
p([
  l()
], u.prototype, "_workspaceEditContentPath", 2);
p([
  l()
], u.prototype, "_value", 2);
p([
  I({ attribute: !1 })
], u.prototype, "value", 1);
u = p([
  $(Ee)
], u);
const Ce = u;
var ge = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, f = (t, e, r, s) => {
  for (var i = s > 1 ? void 0 : s ? Te(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (s ? n(e, r, i) : n(i)) || i);
  return s && i && ge(e, r, i), i;
}, z = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, g = (t, e, r) => (z(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ke = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, Ae = (t, e, r, s) => (z(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r), m;
const Re = "block-list-preview";
let d = class extends V {
  constructor() {
    super(), ke(this, m, void 0), this._htmlMarkup = "", this.documentUnique = "", this._blockEditorAlias = "", this.culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(K, (t) => {
      this.observe(t.alias, (e) => {
        this._blockEditorAlias = e;
      });
    }), this.consumeContext(re, (t) => {
      Ae(this, m, t), this.observe(g(this, m).workspaceEditContentPath, (e) => {
        this._workspaceEditContentPath = e;
      }), this.observe(g(this, m).content, (e) => {
        const r = [e];
        this._value = { ...this._value, contentData: r };
      }), this.observe(g(this, m).settings, (e) => {
        if (e !== void 0) {
          const r = [e];
          this._value = { ...this._value, settingsData: r };
        }
      }), this.observe(g(this, m).layout, (e) => {
        const r = [e];
        this._value = { ...this._value, layout: { "Umbraco.BlockList": r } };
      });
    }), this.consumeContext(F, (t) => {
      this.culture = t.getVariantId().culture ?? void 0;
    }), this.consumeContext(W, (t) => {
      const e = t;
      this.observe(e.unique, (r) => {
        this.documentUnique = r;
      });
    });
  }
  set value(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._value = e;
  }
  get value() {
    return this._value;
  }
  async connectedCallback() {
    if (super.connectedCallback(), this.value != null) {
      const { data: t } = await P(this, B.postUmbracoManagementApiV1BlockPreviewPreviewList({ blockEditorAlias: this._blockEditorAlias, culture: this.culture, pageKey: this.documentUnique, requestBody: JSON.stringify(this.value) }));
      t && (this._htmlMarkup = t);
    }
  }
  render() {
    if (this._htmlMarkup !== "")
      return j`
                <a href=${H(this._workspaceEditContentPath)}>
                    ${G(this._htmlMarkup)}
                </a>`;
  }
};
m = /* @__PURE__ */ new WeakMap();
d.styles = [
  U`
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
f([
  l()
], d.prototype, "_htmlMarkup", 2);
f([
  l()
], d.prototype, "documentUnique", 2);
f([
  l()
], d.prototype, "_blockEditorAlias", 2);
f([
  l()
], d.prototype, "culture", 2);
f([
  l()
], d.prototype, "_workspaceEditContentPath", 2);
f([
  l()
], d.prototype, "_value", 2);
f([
  I({ attribute: !1 })
], d.prototype, "value", 1);
d = f([
  $(Re)
], d);
const Se = d, Ie = async (t, e) => {
  const s = await new me(t).getSettings();
  let i = [];
  s && (s.blockGrid.enabled && i.push({
    type: "blockEditorCustomView",
    alias: "BlockPreview.GridCustomView",
    name: "BlockPreview Grid Custom View",
    element: Ce,
    forContentTypeAlias: s.blockGrid.contentTypes ?? [],
    forBlockEditor: "block-grid"
  }), s.blockList.enabled && i.push({
    type: "blockEditorCustomView",
    alias: "BlockPreview.ListCustomView",
    name: "BlockPreview List Custom View",
    element: Se,
    forContentTypeAlias: s.blockList.contentTypes ?? [],
    forBlockEditor: "block-grid"
  })), e.registerMany([
    ...i
  ]), t.consumeContext(Z, async (o) => {
    if (!o)
      return;
    const n = o.getOpenApiConfiguration();
    _.BASE = n.base, _.TOKEN = n.token, _.WITH_CREDENTIALS = n.withCredentials, _.CREDENTIALS = n.credentials;
  });
};
export {
  u as BlockGridPreviewCustomView,
  d as BlockListPreviewCustomView,
  ye as SettingsDataSource,
  me as SettingsRepository,
  Ie as onInit
};
//# sourceMappingURL=assets.js.map
