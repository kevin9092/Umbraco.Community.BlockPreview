var $ = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var f = (t, e, r) => ($(t, e, "read from private field"), r ? r.call(t) : e.get(t)), w = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, v = (t, e, r, o) => ($(t, e, "write to private field"), o ? o.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as ue } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as x } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as F } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as he } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as K } from "@umbraco-cms/backoffice/document";
import { css as X, state as p, property as J, customElement as z, html as Y, ifDefined as Q, unsafeHTML as Z } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ee } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as D, UmbObjectState as pe } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as te, UMB_PROPERTY_CONTEXT as re } from "@umbraco-cms/backoffice/property";
import { UmbContextToken as fe } from "@umbraco-cms/backoffice/context-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as ye } from "@umbraco-cms/backoffice/block-list";
class H extends Error {
  constructor(e, r, o) {
    super(o), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class me extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class be {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, o) => {
      this._resolve = r, this._reject = o;
      const s = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, i = (a) => {
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
      }), e(s, i, n);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new me("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class W {
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
const h = {
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
    request: new W(),
    response: new W()
  }
}, _ = (t) => typeof t == "string", R = (t) => _(t) && t !== "", q = (t) => t instanceof Blob, oe = (t) => t instanceof FormData, we = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ve = (t) => {
  const e = [], r = (s, i) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(i))}`);
  }, o = (s, i) => {
    i != null && (i instanceof Date ? r(s, i.toISOString()) : Array.isArray(i) ? i.forEach((n) => o(s, n)) : typeof i == "object" ? Object.entries(i).forEach(([n, a]) => o(`${s}[${n}]`, a)) : r(s, i));
  };
  return Object.entries(t).forEach(([s, i]) => o(s, i)), e.length ? `?${e.join("&")}` : "";
}, ke = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, o = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (i, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : i;
  }), s = t.BASE + o;
  return e.query ? s + ve(e.query) : s;
}, Ee = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (o, s) => {
      _(s) || q(s) ? e.append(o, s) : e.append(o, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([, o]) => o != null).forEach(([o, s]) => {
      Array.isArray(s) ? s.forEach((i) => r(o, i)) : r(o, s);
    }), e;
  }
}, C = async (t, e) => typeof e == "function" ? e(t) : e, Te = async (t, e) => {
  const [r, o, s, i] = await Promise.all([
    // @ts-ignore
    C(e, t.TOKEN),
    // @ts-ignore
    C(e, t.USERNAME),
    // @ts-ignore
    C(e, t.PASSWORD),
    // @ts-ignore
    C(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...i,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [c, l]) => ({
    ...a,
    [c]: String(l)
  }), {});
  if (R(r) && (n.Authorization = `Bearer ${r}`), R(o) && R(s)) {
    const a = we(`${o}:${s}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : q(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : _(e.body) ? n["Content-Type"] = "text/plain" : oe(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, ge = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : _(t.body) || q(t.body) || oe(t.body) ? t.body : JSON.stringify(t.body);
}, _e = async (t, e, r, o, s, i, n) => {
  const a = new AbortController();
  let c = {
    headers: i,
    body: o ?? s,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (c.credentials = t.CREDENTIALS);
  for (const l of t.interceptors.request._fns)
    c = await l(c);
  return n(() => a.abort()), await fetch(r, c);
}, Ce = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (_(r))
      return r;
  }
}, Se = async (t) => {
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
}, Ae = (t, e) => {
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
    throw new H(t, e, o);
  if (!e.ok) {
    const s = e.status ?? "unknown", i = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new H(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${i}; body: ${n}`
    );
  }
}, S = (t, e) => new be(async (r, o, s) => {
  try {
    const i = ke(t, e), n = Ee(e), a = ge(e), c = await Te(t, e);
    if (!s.isCancelled) {
      let l = await _e(t, e, i, a, n, c, s);
      for (const de of t.interceptors.response._fns)
        l = await de(l);
      const M = await Se(l), le = Ce(l, e.responseHeader);
      let G = M;
      e.responseTransformer && l.ok && (G = await e.responseTransformer(M));
      const I = {
        url: i,
        ok: l.ok,
        status: l.status,
        statusText: l.statusText,
        body: le ?? G
      };
      Ae(e, I), r(I.body);
    }
  } catch (i) {
    o(i);
  }
});
class U {
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
    return S(h, {
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
    return S(h, {
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
    return S(h, {
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
    return S(h, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var E;
class Re {
  constructor(e) {
    w(this, E, void 0);
    v(this, E, e);
  }
  async getSettings() {
    return await x(f(this, E), U.getSettings());
  }
}
E = new WeakMap();
var T;
class se extends F {
  constructor(r) {
    super(r);
    w(this, T, void 0);
    v(this, T, new Re(r));
  }
  async getSettings() {
    const r = await f(this, T).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
T = new WeakMap();
const ie = new fe("BlockPreviewContext");
var Pe = Object.defineProperty, Oe = Object.getOwnPropertyDescriptor, N = (t, e, r, o) => {
  for (var s = o > 1 ? void 0 : o ? Oe(e, r) : e, i = t.length - 1, n; i >= 0; i--)
    (n = t[i]) && (s = (o ? n(e, r, s) : n(s)) || s);
  return o && s && Pe(e, r, s), s;
}, Be = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, P = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, L = (t, e, r) => (Be(t, e, "access private method"), r), O, ne, j, ae, V, ce;
const xe = "block-grid-preview";
let b = class extends ee {
  constructor() {
    super(), P(this, O), P(this, j), P(this, V), this.htmlMarkup = "", this.documentTypeUnique = "", this.contentUdi = "", this.settingsUdi = null, this.blockEditorAlias = "", this.culture = "", this._blockGridValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(ie, async (t) => {
      this.observe(t.settings, (e) => {
        var r, o;
        (r = e == null ? void 0 : e.blockGrid) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = (o = e == null ? void 0 : e.blockGrid) == null ? void 0 : o.stylesheet);
      });
    }), this.consumeContext(te, async (t) => {
      this.culture = t.getVariantId().culture ?? "";
    }), this.consumeContext(K, (t) => {
      this.observe(t.contentTypeUnique, async (e) => {
        this.documentTypeUnique = e, L(this, O, ne).call(this);
      });
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
      return Y`
                ${this._styleElement}
                <a href=${Q(this.workspaceEditContentPath)}>
                    ${Z(this.htmlMarkup)}
                </a>`;
  }
};
O = /* @__PURE__ */ new WeakSet();
ne = function() {
  this.consumeContext(re, (t) => {
    this.observe(
      D([t.alias, t.value]),
      async ([e, r]) => {
        this.blockEditorAlias = e, this.blockGridValue = {
          ...this.blockGridValue,
          contentData: r.contentData,
          settingsData: r.settingsData,
          layout: r.layout
        }, L(this, j, ae).call(this);
      }
    );
  });
};
j = /* @__PURE__ */ new WeakSet();
ae = function() {
  this.consumeContext(he, (t) => {
    this.observe(
      D([t.contentUdi, t.settingsUdi, t.workspaceEditContentPath, t.contentElementType]),
      async ([e, r, o, s]) => {
        this.contentUdi = e, this.settingsUdi = r ?? void 0, this.contentElementType = s, this.workspaceEditContentPath = o, await L(this, V, ce).call(this);
      }
    );
  });
};
V = /* @__PURE__ */ new WeakSet();
ce = async function() {
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
  }, { data: e } = await x(this, U.previewGridBlock(t));
  e && (this.htmlMarkup = e);
};
b.styles = [
  X`
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
N([
  p()
], b.prototype, "htmlMarkup", 2);
N([
  J({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = N([
  z(xe)
], b);
var De = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, u = (t, e, r, o) => {
  for (var s = o > 1 ? void 0 : o ? qe(e, r) : e, i = t.length - 1, n; i >= 0; i--)
    (n = t[i]) && (s = (o ? n(e, r, s) : n(s)) || s);
  return o && s && De(e, r, s), s;
}, Ue = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Ne = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, A = (t, e, r) => (Ue(t, e, "access private method"), r), y, k;
const Le = "block-list-preview";
let d = class extends ee {
  constructor() {
    super(), Ne(this, y), this.htmlMarkup = "", this.documentTypeUnique = "", this.blockEditorAlias = "", this.culture = "", this._blockListValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(re, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await A(this, y, k).call(this);
      });
    }), this.consumeContext(te, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await A(this, y, k).call(this);
    }), this.consumeContext(K, (t) => {
      this.observe(t.contentTypeUnique, async (e) => {
        this.documentTypeUnique = e, await A(this, y, k).call(this);
      });
    }), this.consumeContext(ye, (t) => {
      this.observe(
        D([t.workspaceEditContentPath, t.content, t.settings, t.layout, t.contentElementType]),
        async ([e, r, o, s, i]) => {
          this.contentElementType = i, this.workspaceEditContentPath = e, this._blockListValue = {
            ...this._blockListValue,
            contentData: [r],
            settingsData: [o],
            layout: { "Umbraco.BlockList": [s] }
          }, await A(this, y, k).call(this);
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
      return Y`
                <a href=${Q(this.workspaceEditContentPath)}>
                    ${Z(this.htmlMarkup)}
                </a>`;
  }
};
y = /* @__PURE__ */ new WeakSet();
k = async function() {
  if (!this.documentTypeUnique || !this.blockEditorAlias || !this.contentElementType || !this.blockListValue.contentData || !this.blockListValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    contentElementAlias: this.contentElementType.alias,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockListValue)
  }, { data: e } = await x(this, U.previewListBlock(t));
  e && (this.htmlMarkup = e);
};
d.styles = [
  X`
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
u([
  p()
], d.prototype, "htmlMarkup", 2);
u([
  p()
], d.prototype, "documentTypeUnique", 2);
u([
  p()
], d.prototype, "blockEditorAlias", 2);
u([
  p()
], d.prototype, "culture", 2);
u([
  p()
], d.prototype, "workspaceEditContentPath", 2);
u([
  p()
], d.prototype, "contentElementType", 2);
u([
  p()
], d.prototype, "_blockListValue", 2);
u([
  J({ attribute: !1 })
], d.prototype, "blockListValue", 1);
d = u([
  z(Le)
], d);
const je = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Me)
  }
], Ve = [...je];
var g, m;
class B extends F {
  constructor(r) {
    super(r);
    w(this, g, void 0);
    w(this, m, void 0);
    v(this, m, new pe(void 0)), this.settings = f(this, m).asObservable(), v(this, g, new se(r)), this.getSettings();
  }
  async getSettings() {
    const r = await f(this, g).getSettings();
    f(this, m).setValue(r);
  }
}
g = new WeakMap(), m = new WeakMap();
const Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: B,
  default: B
}, Symbol.toStringTag, { value: "Module" })), Ze = async (t, e) => {
  var i, n;
  const o = await new se(t).getSettings();
  let s = [];
  if (o) {
    if (o.blockGrid.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: b,
        forBlockEditor: "block-grid"
      };
      ((i = o.blockGrid.contentTypes) == null ? void 0 : i.length) !== 0 && (a.forContentTypeAlias = o.blockGrid.contentTypes), s.push(a);
    }
    if (o.blockList.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: d,
        forBlockEditor: "block-list"
      };
      ((n = o.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (a.forContentTypeAlias = o.blockList.contentTypes), s.push(a);
    }
  }
  e.registerMany([
    ...s,
    ...Ve
  ]), t.provideContext(ie, new B(t)), t.consumeContext(ue, async (a) => {
    if (!a)
      return;
    const c = a.getOpenApiConfiguration();
    h.BASE = c.base, h.TOKEN = c.token, h.WITH_CREDENTIALS = c.withCredentials, h.CREDENTIALS = c.credentials;
  });
};
export {
  b as BlockGridPreviewCustomView,
  d as BlockListPreviewCustomView,
  Re as SettingsDataSource,
  se as SettingsRepository,
  Ze as onInit
};
//# sourceMappingURL=assets.js.map
