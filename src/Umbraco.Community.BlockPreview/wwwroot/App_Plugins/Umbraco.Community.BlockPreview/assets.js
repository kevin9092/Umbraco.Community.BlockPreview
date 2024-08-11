var N = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var _ = (t, e, r) => (N(t, e, "read from private field"), r ? r.call(t) : e.get(t)), C = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, A = (t, e, r, i) => (N(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as Z } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as D } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as ee } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as te } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as M } from "@umbraco-cms/backoffice/document";
import { css as V, state as c, property as G, customElement as I, html as $, ifDefined as H, unsafeHTML as F } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as W } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as S } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_CONTEXT as J, UMB_PROPERTY_DATASET_CONTEXT as K } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as re } from "@umbraco-cms/backoffice/block-list";
class L extends Error {
  constructor(e, r, i) {
    super(i), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
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
class ie {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, i) => {
      this._resolve = r, this._reject = i;
      const o = (a) => {
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
      }), e(o, s, n);
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
class j {
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
const y = {
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
    request: new j(),
    response: new j()
  }
}, T = (t) => typeof t == "string", R = (t) => T(t) && t !== "", O = (t) => t instanceof Blob, X = (t) => t instanceof FormData, se = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ne = (t) => {
  const e = [], r = (o, s) => {
    e.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(s))}`);
  }, i = (o, s) => {
    s != null && (s instanceof Date ? r(o, s.toISOString()) : Array.isArray(s) ? s.forEach((n) => i(o, n)) : typeof s == "object" ? Object.entries(s).forEach(([n, a]) => i(`${o}[${n}]`, a)) : r(o, s));
  };
  return Object.entries(t).forEach(([o, s]) => i(o, s)), e.length ? `?${e.join("&")}` : "";
}, ae = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (s, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : s;
  }), o = t.BASE + i;
  return e.query ? o + ne(e.query) : o;
}, ce = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (i, o) => {
      T(o) || O(o) ? e.append(i, o) : e.append(i, JSON.stringify(o));
    };
    return Object.entries(t.formData).filter(([, i]) => i != null).forEach(([i, o]) => {
      Array.isArray(o) ? o.forEach((s) => r(i, s)) : r(i, o);
    }), e;
  }
}, k = async (t, e) => typeof e == "function" ? e(t) : e, le = async (t, e) => {
  const [r, i, o, s] = await Promise.all([
    // @ts-ignore
    k(e, t.TOKEN),
    // @ts-ignore
    k(e, t.USERNAME),
    // @ts-ignore
    k(e, t.PASSWORD),
    // @ts-ignore
    k(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...s,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [d, u]) => ({
    ...a,
    [d]: String(u)
  }), {});
  if (R(r) && (n.Authorization = `Bearer ${r}`), R(i) && R(o)) {
    const a = se(`${i}:${o}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : O(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : T(e.body) ? n["Content-Type"] = "text/plain" : X(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, de = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : T(t.body) || O(t.body) || X(t.body) ? t.body : JSON.stringify(t.body);
}, ue = async (t, e, r, i, o, s, n) => {
  const a = new AbortController();
  let d = {
    headers: s,
    body: i ?? o,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (d.credentials = t.CREDENTIALS);
  for (const u of t.interceptors.request._fns)
    d = await u(d);
  return n(() => a.abort()), await fetch(r, d);
}, he = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (T(r))
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
    const o = e.status ?? "unknown", s = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new L(
      t,
      e,
      `Generic Error: status: ${o}; status text: ${s}; body: ${n}`
    );
  }
}, v = (t, e) => new ie(async (r, i, o) => {
  try {
    const s = ae(t, e), n = ce(e), a = de(e), d = await le(t, e);
    if (!o.isCancelled) {
      let u = await ue(t, e, s, a, n, d, o);
      for (const Q of t.interceptors.response._fns)
        u = await Q(u);
      const B = await pe(u), Y = he(u, e.responseHeader);
      let U = B;
      e.responseTransformer && u.ok && (U = await e.responseTransformer(B));
      const x = {
        url: s,
        ok: u.ok,
        status: u.status,
        statusText: u.statusText,
        body: Y ?? U
      };
      fe(e, x), r(x.body);
    }
  } catch (s) {
    i(s);
  }
});
class q {
  /**
   * @param data The data for the request.
   * @param data.blockEditorAlias
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.contentUdi
   * @param data.settingsUdi
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewGridBlock(e = {}) {
    return v(y, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
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
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewListBlock(e = {}) {
    return v(y, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
      query: {
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
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
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewRichTextMarkup(e = {}) {
    return v(y, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/rte",
      query: {
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
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
    return v(y, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var E;
class ye {
  constructor(e) {
    C(this, E, void 0);
    A(this, E, e);
  }
  async getSettings() {
    return await D(_(this, E), q.getSettings());
  }
}
E = new WeakMap();
var w;
class me extends ee {
  constructor(r) {
    super(r);
    C(this, w, void 0);
    A(this, w, new ye(r));
  }
  async getSettings() {
    const r = await _(this, w).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
w = new WeakMap();
var be = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, p = (t, e, r, i) => {
  for (var o = i > 1 ? void 0 : i ? Ee(e, r) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (o = (i ? n(e, r, o) : n(o)) || o);
  return i && o && be(e, r, o), o;
}, we = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Te = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, ke = (t, e, r) => (we(t, e, "access private method"), r), P, z;
const ve = "block-grid-preview";
let l = class extends W {
  constructor() {
    super(), Te(this, P), this.htmlMarkup = "", this.documentTypeUnique = "", this.contentUdi = "", this.settingsUdi = null, this.blockEditorAlias = "", this.culture = "", this._blockGridValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(J, (t) => {
      this.observe(
        S([t.alias, t.value]),
        async ([e, r]) => {
          this.blockEditorAlias = e, this.blockGridValue = {
            ...this.blockGridValue,
            contentData: r.contentData,
            settingsData: r.settingsData,
            layout: r.layout
          };
        }
      );
    }), this.consumeContext(K, async (t) => {
      this.culture = t.getVariantId().culture ?? "";
    }), this.consumeContext(M, (t) => {
      this.observe(t.contentTypeUnique, async (e) => {
        this.documentTypeUnique = e;
      });
    }), this.consumeContext(te, (t) => {
      this.observe(
        S([t.contentUdi, t.settingsUdi, t.workspaceEditContentPath, t.contentElementType]),
        async ([e, r, i, o]) => {
          this.contentUdi = e, this.settingsUdi = r ?? void 0, this.contentElementType = o, this.workspaceEditContentPath = i, await ke(this, P, z).call(this);
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
      return $`
                <a href=${H(this.workspaceEditContentPath)}>
                    ${F(this.htmlMarkup)}
                </a>`;
  }
};
P = /* @__PURE__ */ new WeakSet();
z = async function() {
  if (!this.documentTypeUnique || !this.blockEditorAlias || !this.contentUdi || !this.contentElementType || this.settingsUdi === null || !this.blockGridValue.contentData || !this.blockGridValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    contentElementAlias: this.contentElementType.alias,
    documentTypeUnique: this.documentTypeUnique,
    contentUdi: this.contentUdi,
    settingsUdi: this.settingsUdi,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockGridValue)
  }, { data: e } = await D(this, q.previewGridBlock(t));
  e && (this.htmlMarkup = e);
};
l.styles = [
  V`
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
  G({ attribute: !1 })
], l.prototype, "blockGridValue", 1);
l = p([
  I(ve)
], l);
var ge = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, f = (t, e, r, i) => {
  for (var o = i > 1 ? void 0 : i ? _e(e, r) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (o = (i ? n(e, r, o) : n(o)) || o);
  return i && o && ge(e, r, o), o;
}, Ce = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Ae = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, g = (t, e, r) => (Ce(t, e, "access private method"), r), m, b;
const Re = "block-list-preview";
let h = class extends W {
  constructor() {
    super(), Ae(this, m), this.htmlMarkup = "", this.documentTypeUnique = "", this.blockEditorAlias = "", this.culture = "", this._blockListValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(J, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await g(this, m, b).call(this);
      });
    }), this.consumeContext(K, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await g(this, m, b).call(this);
    }), this.consumeContext(M, (t) => {
      this.observe(t.contentTypeUnique, async (e) => {
        this.documentTypeUnique = e, await g(this, m, b).call(this);
      });
    }), this.consumeContext(re, (t) => {
      this.observe(
        S([t.workspaceEditContentPath, t.content, t.settings, t.layout, t.contentElementType]),
        async ([e, r, i, o, s]) => {
          this.contentElementType = s, this.workspaceEditContentPath = e, this._blockListValue = {
            ...this._blockListValue,
            contentData: [r],
            settingsData: [i],
            layout: { "Umbraco.BlockList": [o] }
          }, await g(this, m, b).call(this);
        }
      );
    });
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  render() {
    if (this.htmlMarkup !== "")
      return $`
                <a href=${H(this.workspaceEditContentPath)}>
                    ${F(this.htmlMarkup)}
                </a>`;
  }
};
m = /* @__PURE__ */ new WeakSet();
b = async function() {
  if (!this.documentTypeUnique || !this.blockEditorAlias || !this.contentElementType || !this.blockListValue.contentData || !this.blockListValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    contentElementAlias: this.contentElementType.alias,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockListValue)
  }, { data: e } = await D(this, q.previewListBlock(t));
  e && (this.htmlMarkup = e);
};
h.styles = [
  V`
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
f([
  c()
], h.prototype, "htmlMarkup", 2);
f([
  c()
], h.prototype, "documentTypeUnique", 2);
f([
  c()
], h.prototype, "blockEditorAlias", 2);
f([
  c()
], h.prototype, "culture", 2);
f([
  c()
], h.prototype, "workspaceEditContentPath", 2);
f([
  c()
], h.prototype, "contentElementType", 2);
f([
  c()
], h.prototype, "_blockListValue", 2);
f([
  G({ attribute: !1 })
], h.prototype, "blockListValue", 1);
h = f([
  I(Re)
], h);
const Me = async (t, e) => {
  var s, n;
  const i = await new me(t).getSettings();
  let o = [];
  if (i) {
    if (i.blockGrid.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: l,
        forBlockEditor: "block-grid"
      };
      ((s = i.blockGrid.contentTypes) == null ? void 0 : s.length) !== 0 && (a.forContentTypeAlias = i.blockGrid.contentTypes), o.push(a);
    }
    if (i.blockList.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: h,
        forBlockEditor: "block-list"
      };
      ((n = i.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (a.forContentTypeAlias = i.blockList.contentTypes), o.push(a);
    }
  }
  e.registerMany([
    ...o
  ]), t.consumeContext(Z, async (a) => {
    if (!a)
      return;
    const d = a.getOpenApiConfiguration();
    y.BASE = d.base, y.TOKEN = d.token, y.WITH_CREDENTIALS = d.withCredentials, y.CREDENTIALS = d.credentials;
  });
};
export {
  l as BlockGridPreviewCustomView,
  h as BlockListPreviewCustomView,
  ye as SettingsDataSource,
  me as SettingsRepository,
  Me as onInit
};
//# sourceMappingURL=assets.js.map
