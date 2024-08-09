var M = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var S = (t, e, r) => (M(t, e, "read from private field"), r ? r.call(t) : e.get(t)), A = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, P = (t, e, r, o) => (M(t, e, "write to private field"), o ? o.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as ee } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as O } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as te } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as re } from "@umbraco-cms/backoffice/block-grid";
import { css as G, state as c, property as I, customElement as $, html as H, ifDefined as V, unsafeHTML as F } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as W } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as J, UMB_PROPERTY_DATASET_CONTEXT as K } from "@umbraco-cms/backoffice/property";
import { observeMultiple as X } from "@umbraco-cms/backoffice/observable-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as z } from "@umbraco-cms/backoffice/document";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as ie } from "@umbraco-cms/backoffice/block-list";
class j extends Error {
  constructor(e, r, o) {
    super(o), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class oe extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class se {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, o) => {
      this._resolve = r, this._reject = o;
      const i = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, s = (a) => {
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
      }), e(i, s, n);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new oe("Request aborted"));
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
const f = {
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
}, k = (t) => typeof t == "string", D = (t) => k(t) && t !== "", q = (t) => t instanceof Blob, Y = (t) => t instanceof FormData, ne = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ae = (t) => {
  const e = [], r = (i, s) => {
    e.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(s))}`);
  }, o = (i, s) => {
    s != null && (s instanceof Date ? r(i, s.toISOString()) : Array.isArray(s) ? s.forEach((n) => o(i, n)) : typeof s == "object" ? Object.entries(s).forEach(([n, a]) => o(`${i}[${n}]`, a)) : r(i, s));
  };
  return Object.entries(t).forEach(([i, s]) => o(i, s)), e.length ? `?${e.join("&")}` : "";
}, ce = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, o = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (s, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : s;
  }), i = t.BASE + o;
  return e.query ? i + ae(e.query) : i;
}, le = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (o, i) => {
      k(i) || q(i) ? e.append(o, i) : e.append(o, JSON.stringify(i));
    };
    return Object.entries(t.formData).filter(([, o]) => o != null).forEach(([o, i]) => {
      Array.isArray(i) ? i.forEach((s) => r(o, s)) : r(o, i);
    }), e;
  }
}, _ = async (t, e) => typeof e == "function" ? e(t) : e, de = async (t, e) => {
  const [r, o, i, s] = await Promise.all([
    // @ts-ignore
    _(e, t.TOKEN),
    // @ts-ignore
    _(e, t.USERNAME),
    // @ts-ignore
    _(e, t.PASSWORD),
    // @ts-ignore
    _(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...s,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [d, u]) => ({
    ...a,
    [d]: String(u)
  }), {});
  if (D(r) && (n.Authorization = `Bearer ${r}`), D(o) && D(i)) {
    const a = ne(`${o}:${i}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : q(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : k(e.body) ? n["Content-Type"] = "text/plain" : Y(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, ue = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : k(t.body) || q(t.body) || Y(t.body) ? t.body : JSON.stringify(t.body);
}, he = async (t, e, r, o, i, s, n) => {
  const a = new AbortController();
  let d = {
    headers: s,
    body: o ?? i,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (d.credentials = t.CREDENTIALS);
  for (const u of t.interceptors.request._fns)
    d = await u(d);
  return n(() => a.abort()), await fetch(r, d);
}, pe = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (k(r))
      return r;
  }
}, fe = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((o) => e.includes(o)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, ye = (t, e) => {
  const o = {
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
  if (o)
    throw new j(t, e, o);
  if (!e.ok) {
    const i = e.status ?? "unknown", s = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new j(
      t,
      e,
      `Generic Error: status: ${i}; status text: ${s}; body: ${n}`
    );
  }
}, C = (t, e) => new se(async (r, o, i) => {
  try {
    const s = ce(t, e), n = le(e), a = ue(e), d = await de(t, e);
    if (!i.isCancelled) {
      let u = await he(t, e, s, a, n, d, i);
      for (const Z of t.interceptors.response._fns)
        u = await Z(u);
      const B = await fe(u), Q = pe(u, e.responseHeader);
      let U = B;
      e.responseTransformer && u.ok && (U = await e.responseTransformer(B));
      const N = {
        url: s,
        ok: u.ok,
        status: u.status,
        statusText: u.statusText,
        body: Q ?? U
      };
      ye(e, N), r(N.body);
    }
  } catch (s) {
    o(s);
  }
});
class x {
  /**
   * @param data The data for the request.
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.contentUdi
   * @param data.settingsUdi
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewGridMarkup(e = {}) {
    return C(f, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        blockEditorAlias: e.blockEditorAlias,
        culture: e.culture,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi
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
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewListMarkup(e = {}) {
    return C(f, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
      query: {
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
   * @param data.blockEditorAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewRichTextMarkup(e = {}) {
    return C(f, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/rte",
      query: {
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
    return C(f, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var T;
class me {
  constructor(e) {
    A(this, T, void 0);
    P(this, T, e);
  }
  async getSettings() {
    return await O(S(this, T), x.getSettings());
  }
}
T = new WeakMap();
var E;
class be extends te {
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
var ve = Object.defineProperty, we = Object.getOwnPropertyDescriptor, p = (t, e, r, o) => {
  for (var i = o > 1 ? void 0 : o ? we(e, r) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (i = (o ? n(e, r, i) : n(i)) || i);
  return o && i && ve(e, r, i), i;
}, ge = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Te = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, w = (t, e, r) => (ge(t, e, "access private method"), r), m, b;
const Ee = "block-grid-preview";
let l = class extends W {
  constructor() {
    super(), Te(this, m), this.htmlMarkup = "", this.documentTypeUnique = "", this.contentUdi = "", this.settingsUdi = null, this.blockEditorAlias = "", this.culture = "", this._blockGridValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(J, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await w(this, m, b).call(this);
      }), this.observe(t.value, async (e) => {
        this.blockGridValue = {
          ...this.blockGridValue,
          contentData: e.contentData,
          settingsData: e.settingsData,
          layout: e.layout
        }, await w(this, m, b).call(this);
      });
    }), this.consumeContext(K, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await w(this, m, b).call(this);
    }), this.consumeContext(z, (t) => {
      this.observe(t.contentTypeUnique, async (e) => {
        this.documentTypeUnique = e, await w(this, m, b).call(this);
      });
    }), this.consumeContext(re, (t) => {
      this.observe(
        X([t.contentUdi, t.settingsUdi, t.workspaceEditContentPath, t.contentElementType]),
        async ([e, r, o, i]) => {
          this.contentUdi = e, this.settingsUdi = r ?? void 0, this.contentElementType = i, this.workspaceEditContentPath = o, await w(this, m, b).call(this);
        }
      );
    });
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  render() {
    if (this.htmlMarkup !== "")
      return H`
                <a href=${V(this.workspaceEditContentPath)}>
                    ${F(this.htmlMarkup)}
                </a>`;
  }
};
m = /* @__PURE__ */ new WeakSet();
b = async function() {
  var r;
  if (((r = this.contentElementType) == null ? void 0 : r.alias) === "richTextBlock")
    debugger;
  if (!this.documentTypeUnique || !this.blockEditorAlias || !this.contentUdi || !this.contentElementType || this.settingsUdi === null || !this.blockGridValue.contentData || !this.blockGridValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    documentTypeUnique: this.documentTypeUnique,
    contentUdi: this.contentUdi,
    settingsUdi: this.settingsUdi,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockGridValue)
  }, { data: e } = await O(this, x.previewGridMarkup(t));
  e && (this.htmlMarkup = e);
};
l.styles = [
  G`
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

            .preview-alert {
                background-color: var(--uui-color-danger, #f0ac00);
                border: 1px solid transparent;
                border-radius: 0;
                margin-bottom: 20px;
                padding: 8px 35px 8px 14px;
                position: relative;

                &, a, h4 {
                    color: #fff;
                }

                pre {
                    white-space: normal;
                }
            }

            .preview-alert-warning {
                background-color: var(--uui-color-danger, #f0ac00);
                border-color: transparent;
                color: #fff;
            }

            .preview-alert-info {
                background-color: var(--uui-color-default, #3544b1);
                border-color: transparent;
                color: #fff;
            }

            .preview-alert-danger, .preview-alert-error {
                background-color: var(--uui-color-danger, #f0ac00);
                border-color: transparent;
                color: #fff;
            }
        `
];
p([
  c()
], l.prototype, "htmlMarkup", 2);
p([
  c()
], l.prototype, "documentTypeUnique", 2);
p([
  c()
], l.prototype, "contentUdi", 2);
p([
  c()
], l.prototype, "settingsUdi", 2);
p([
  c()
], l.prototype, "blockEditorAlias", 2);
p([
  c()
], l.prototype, "culture", 2);
p([
  c()
], l.prototype, "workspaceEditContentPath", 2);
p([
  c()
], l.prototype, "contentElementType", 2);
p([
  c()
], l.prototype, "_blockGridValue", 2);
p([
  I({ attribute: !1 })
], l.prototype, "blockGridValue", 1);
l = p([
  $(Ee)
], l);
var ke = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, y = (t, e, r, o) => {
  for (var i = o > 1 ? void 0 : o ? _e(e, r) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (i = (o ? n(e, r, i) : n(i)) || i);
  return o && i && ke(e, r, i), i;
}, Ce = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Re = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, R = (t, e, r) => (Ce(t, e, "access private method"), r), v, g;
const Se = "block-list-preview";
let h = class extends W {
  constructor() {
    super(), Re(this, v), this.htmlMarkup = "", this.documentUnique = "", this.blockEditorAlias = "", this.culture = "", this._value = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(J, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await R(this, v, g).call(this);
      });
    }), this.consumeContext(K, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await R(this, v, g).call(this);
    }), this.consumeContext(z, (t) => {
      this.observe(t.unique, async (e) => {
        this.documentUnique = e, await R(this, v, g).call(this);
      });
    }), this.consumeContext(ie, (t) => {
      this.observe(
        X([t.workspaceEditContentPath, t.content, t.settings, t.layout]),
        async ([e, r, o, i]) => {
          this.workspaceEditContentPath = e, this._value = {
            ...this._value,
            contentData: [r],
            settingsData: [o],
            layout: { "Umbraco.BlockList": [i] }
          }, await R(this, v, g).call(this);
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
      return H`
                <a href=${V(this.workspaceEditContentPath)}>
                    ${F(this.htmlMarkup)}
                </a>`;
  }
};
v = /* @__PURE__ */ new WeakSet();
g = async function() {
  if (!this.blockEditorAlias || !this.value.contentData || !this.value.layout)
    return;
  const t = { blockEditorAlias: this.blockEditorAlias, culture: this.culture, requestBody: JSON.stringify(this.value) }, { data: e } = await O(this, x.previewListMarkup(t));
  e && (this.htmlMarkup = e);
};
h.styles = [
  G`
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

            .preview-alert {
                background-color: var(--uui-color-danger, #f0ac00);
                border: 1px solid transparent;
                border-radius: 0;
                margin-bottom: 20px;
                padding: 8px 35px 8px 14px;
                position: relative;

                &, a, h4 {
                    color: #fff;
                }

                pre {
                    white-space: normal;
                }
            }

            .preview-alert-warning {
                background-color: var(--uui-color-warning, #f0ac00);
                border-color: transparent;
                color: #fff;
            }

            .preview-alert-info {
                background-color: var(--uui-color-default, #3544b1);
                border-color: transparent;
                color: #fff;
            }

            .preview-alert-danger, .preview-alert-error {
                background-color: var(--uui-color-danger, #f0ac00);
                border-color: transparent;
                color: #fff;
            }
        `
];
y([
  c()
], h.prototype, "htmlMarkup", 2);
y([
  c()
], h.prototype, "documentUnique", 2);
y([
  c()
], h.prototype, "blockEditorAlias", 2);
y([
  c()
], h.prototype, "culture", 2);
y([
  c()
], h.prototype, "workspaceEditContentPath", 2);
y([
  c()
], h.prototype, "_value", 2);
y([
  I({ attribute: !1 })
], h.prototype, "value", 1);
h = y([
  $(Se)
], h);
const Le = async (t, e) => {
  var s, n;
  const o = await new be(t).getSettings();
  let i = [];
  if (o) {
    if (o.blockGrid.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: l,
        forBlockEditor: "block-grid"
      };
      ((s = o.blockGrid.contentTypes) == null ? void 0 : s.length) !== 0 && (a.forContentTypeAlias = o.blockGrid.contentTypes), i.push(a);
    }
    if (o.blockList.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: h,
        forBlockEditor: "block-list"
      };
      ((n = o.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (a.forContentTypeAlias = o.blockList.contentTypes), i.push(a);
    }
  }
  e.registerMany([
    ...i
  ]), t.consumeContext(ee, async (a) => {
    if (!a)
      return;
    const d = a.getOpenApiConfiguration();
    f.BASE = d.base, f.TOKEN = d.token, f.WITH_CREDENTIALS = d.withCredentials, f.CREDENTIALS = d.credentials;
  });
};
export {
  l as BlockGridPreviewCustomView,
  h as BlockListPreviewCustomView,
  me as SettingsDataSource,
  be as SettingsRepository,
  Le as onInit
};
//# sourceMappingURL=assets.js.map
