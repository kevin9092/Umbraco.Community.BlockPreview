var x = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var S = (t, e, r) => (x(t, e, "read from private field"), r ? r.call(t) : e.get(t)), A = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, P = (t, e, r, i) => (x(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as ee } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as D } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as te } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as re } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as U } from "@umbraco-cms/backoffice/document";
import { css as $, state as u, property as H, customElement as G, html as K, ifDefined as F, unsafeHTML as W } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as V } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as J } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_CONTEXT as X, UMB_PROPERTY_DATASET_CONTEXT as z } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as se } from "@umbraco-cms/backoffice/block-list";
class L extends Error {
  constructor(e, r, i) {
    super(i), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class ie extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class oe {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, i) => {
      this._resolve = r, this._reject = i;
      const s = (a) => {
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
      }), e(s, o, n);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new ie("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class I {
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
const p = {
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
    request: new I(),
    response: new I()
  }
}, T = (t) => typeof t == "string", O = (t) => T(t) && t !== "", B = (t) => t instanceof Blob, Y = (t) => t instanceof FormData, ne = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ae = (t) => {
  const e = [], r = (s, o) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, i = (s, o) => {
    o != null && (o instanceof Date ? r(s, o.toISOString()) : Array.isArray(o) ? o.forEach((n) => i(s, n)) : typeof o == "object" ? Object.entries(o).forEach(([n, a]) => i(`${s}[${n}]`, a)) : r(s, o));
  };
  return Object.entries(t).forEach(([s, o]) => i(s, o)), e.length ? `?${e.join("&")}` : "";
}, ce = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : o;
  }), s = t.BASE + i;
  return e.query ? s + ae(e.query) : s;
}, le = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (i, s) => {
      T(s) || B(s) ? e.append(i, s) : e.append(i, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([, i]) => i != null).forEach(([i, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(i, o)) : r(i, s);
    }), e;
  }
}, g = async (t, e) => typeof e == "function" ? e(t) : e, ue = async (t, e) => {
  const [r, i, s, o] = await Promise.all([
    // @ts-ignore
    g(e, t.TOKEN),
    // @ts-ignore
    g(e, t.USERNAME),
    // @ts-ignore
    g(e, t.PASSWORD),
    // @ts-ignore
    g(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [c, l]) => ({
    ...a,
    [c]: String(l)
  }), {});
  if (O(r) && (n.Authorization = `Bearer ${r}`), O(i) && O(s)) {
    const a = ne(`${i}:${s}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : B(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : T(e.body) ? n["Content-Type"] = "text/plain" : Y(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, de = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : T(t.body) || B(t.body) || Y(t.body) ? t.body : JSON.stringify(t.body);
}, he = async (t, e, r, i, s, o, n) => {
  const a = new AbortController();
  let c = {
    headers: o,
    body: i ?? s,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (c.credentials = t.CREDENTIALS);
  for (const l of t.interceptors.request._fns)
    c = await l(c);
  return n(() => a.abort()), await fetch(r, c);
}, pe = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (T(r))
      return r;
  }
}, ye = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((i) => e.includes(i)))
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
  const i = {
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
  if (i)
    throw new L(t, e, i);
  if (!e.ok) {
    const s = e.status ?? "unknown", o = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new L(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${o}; body: ${n}`
    );
  }
}, C = (t, e) => new oe(async (r, i, s) => {
  try {
    const o = ce(t, e), n = le(e), a = de(e), c = await ue(t, e);
    if (!s.isCancelled) {
      let l = await he(t, e, o, a, n, c, s);
      for (const Z of t.interceptors.response._fns)
        l = await Z(l);
      const N = await ye(l), Q = pe(l, e.responseHeader);
      let M = N;
      e.responseTransformer && l.ok && (M = await e.responseTransformer(N));
      const j = {
        url: o,
        ok: l.ok,
        status: l.status,
        statusText: l.statusText,
        body: Q ?? M
      };
      fe(e, j), r(j.body);
    }
  } catch (o) {
    i(o);
  }
});
class q {
  /**
   * @param data The data for the request.
   * @param data.pageKey
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewGridMarkup(e = {}) {
    return C(p, {
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
  static previewListMarkup(e = {}) {
    return C(p, {
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
   * @param data The data for the request.
   * @param data.pageKey
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewRichTextMarkup(e = {}) {
    return C(p, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/rte",
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
  static getSettings() {
    return C(p, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var _;
class me {
  constructor(e) {
    A(this, _, void 0);
    P(this, _, e);
  }
  async getSettings() {
    return await D(S(this, _), q.getUmbracoManagementApiV1BlockPreviewSettings());
  }
}
_ = new WeakMap();
var E;
class ve extends te {
  constructor(r) {
    super(r);
    A(this, E, void 0);
    P(this, E, new me(r));
  }
  async getSettings() {
    const r = await S(this, E).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
E = new WeakMap();
var we = Object.defineProperty, be = Object.getOwnPropertyDescriptor, y = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? be(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (i ? n(e, r, s) : n(s)) || s);
  return i && s && we(e, r, s), s;
}, _e = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Ee = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, k = (t, e, r) => (_e(t, e, "access private method"), r), m, w;
const Te = "block-grid-preview";
let d = class extends V {
  constructor() {
    super(), Ee(this, m), this.htmlMarkup = "", this.documentUnique = "", this.blockEditorAlias = "", this.culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(X, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await k(this, m, w).call(this);
      });
    }), this.consumeContext(z, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await k(this, m, w).call(this);
    }), this.consumeContext(U, (t) => {
      this.observe(t.unique, async (e) => {
        this.documentUnique = e, await k(this, m, w).call(this);
      });
    }), this.consumeContext(re, (t) => {
      this.observe(
        J([t.workspaceEditContentPath, t.content, t.settings, t.layout]),
        async ([e, r, i, s]) => {
          this.workspaceEditContentPath = e, this._value = {
            ...this._value,
            contentData: [r],
            settingsData: [i],
            layout: { "Umbraco.BlockGrid": [s] }
          }, await k(this, m, w).call(this);
        },
        "renderBlockPreview"
      );
    });
  }
  set value(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._value = e;
  }
  get value() {
    return this._value;
  }
  render() {
    if (this.htmlMarkup !== "")
      return K`
                <a href=${F(this.workspaceEditContentPath)}>
                    ${W(this.htmlMarkup)}
                </a>`;
  }
};
m = /* @__PURE__ */ new WeakSet();
w = async function() {
  if (!this.documentUnique || !this.blockEditorAlias || !this.value.contentData || !this.value.layout)
    return;
  const t = { blockEditorAlias: this.blockEditorAlias, culture: this.culture, pageKey: this.documentUnique, requestBody: JSON.stringify(this.value) }, { data: e } = await D(this, q.previewGridMarkup(t));
  e && (this.htmlMarkup = e);
};
d.styles = [
  $`
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
y([
  u()
], d.prototype, "htmlMarkup", 2);
y([
  u()
], d.prototype, "documentUnique", 2);
y([
  u()
], d.prototype, "blockEditorAlias", 2);
y([
  u()
], d.prototype, "culture", 2);
y([
  u()
], d.prototype, "workspaceEditContentPath", 2);
y([
  u()
], d.prototype, "_value", 2);
y([
  H({ attribute: !1 })
], d.prototype, "value", 1);
d = y([
  G(Te)
], d);
var ge = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, f = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Ce(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (i ? n(e, r, s) : n(s)) || s);
  return i && s && ge(e, r, s), s;
}, ke = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Re = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, R = (t, e, r) => (ke(t, e, "access private method"), r), v, b;
const Se = "block-list-preview";
let h = class extends V {
  constructor() {
    super(), Re(this, v), this.htmlMarkup = "", this.documentUnique = "", this.blockEditorAlias = "", this.culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(X, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await R(this, v, b).call(this);
      });
    }), this.consumeContext(z, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await R(this, v, b).call(this);
    }), this.consumeContext(U, (t) => {
      this.observe(t.unique, async (e) => {
        this.documentUnique = e, await R(this, v, b).call(this);
      });
    }), this.consumeContext(se, (t) => {
      this.observe(
        J([t.workspaceEditContentPath, t.content, t.settings, t.layout]),
        async ([e, r, i, s]) => {
          this.workspaceEditContentPath = e, this._value = {
            ...this._value,
            contentData: [r],
            settingsData: [i],
            layout: { "Umbraco.BlockList": [s] }
          }, await R(this, v, b).call(this);
        },
        "renderBlockPreview"
      );
    });
  }
  set value(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._value = e;
  }
  get value() {
    return this._value;
  }
  render() {
    if (this.htmlMarkup !== "")
      return K`
                <a href=${F(this.workspaceEditContentPath)}>
                    ${W(this.htmlMarkup)}
                </a>`;
  }
};
v = /* @__PURE__ */ new WeakSet();
b = async function() {
  if (!this.documentUnique || !this.blockEditorAlias || !this.value.contentData || !this.value.layout)
    return;
  const t = { blockEditorAlias: this.blockEditorAlias, culture: this.culture, pageKey: this.documentUnique, requestBody: JSON.stringify(this.value) }, { data: e } = await D(this, q.previewListMarkup(t));
  e && (this.htmlMarkup = e);
};
h.styles = [
  $`
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
  u()
], h.prototype, "htmlMarkup", 2);
f([
  u()
], h.prototype, "documentUnique", 2);
f([
  u()
], h.prototype, "blockEditorAlias", 2);
f([
  u()
], h.prototype, "culture", 2);
f([
  u()
], h.prototype, "workspaceEditContentPath", 2);
f([
  u()
], h.prototype, "_value", 2);
f([
  H({ attribute: !1 })
], h.prototype, "value", 1);
h = f([
  G(Se)
], h);
const Ie = async (t, e) => {
  var o, n;
  const i = await new ve(t).getSettings();
  let s = [];
  if (i) {
    if (i.blockGrid.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: d,
        forBlockEditor: "block-grid"
      };
      ((o = i.blockGrid.contentTypes) == null ? void 0 : o.length) !== 0 && (a.forContentTypeAlias = i.blockGrid.contentTypes), s.push(a);
    }
    if (i.blockList.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: h,
        forBlockEditor: "block-list"
      };
      ((n = i.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (a.forContentTypeAlias = i.blockList.contentTypes), s.push(a);
    }
  }
  e.registerMany([
    ...s
  ]), t.consumeContext(ee, async (a) => {
    if (!a)
      return;
    const c = a.getOpenApiConfiguration();
    p.BASE = c.base, p.TOKEN = c.token, p.WITH_CREDENTIALS = c.withCredentials, p.CREDENTIALS = c.credentials;
  });
};
export {
  d as BlockGridPreviewCustomView,
  h as BlockListPreviewCustomView,
  me as SettingsDataSource,
  ve as SettingsRepository,
  Ie as onInit
};
//# sourceMappingURL=assets.js.map
