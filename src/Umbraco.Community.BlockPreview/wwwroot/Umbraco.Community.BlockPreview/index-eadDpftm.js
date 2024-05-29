var C = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var d = (t, e, r) => (C(t, e, "read from private field"), r ? r.call(t) : e.get(t)), y = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, m = (t, e, r, s) => (C(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
import { UmbControllerBase as j } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as D } from "@umbraco-cms/backoffice/context-api";
import { tryExecuteAndNotify as S } from "@umbraco-cms/backoffice/resources";
import { UmbStringState as I } from "@umbraco-cms/backoffice/observable-api";
class g extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class L extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class U {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const i = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, n = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(a));
      }, o = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(a);
      };
      return Object.defineProperty(o, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(o, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(o, "isCancelled", {
        get: () => this._isCancelled
      }), e(i, n, o);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new L("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class k {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const r = this._fns.indexOf(e);
    r !== -1 && (this._fns = [
      ...this._fns.slice(0, r),
      ...this._fns.slice(r + 1)
    ]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const u = {
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
    request: new k(),
    response: new k()
  }
}, b = (t) => typeof t == "string", E = (t) => b(t) && t !== "", T = (t) => t instanceof Blob, B = (t) => t instanceof FormData, H = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, V = (t) => {
  const e = [], r = (i, n) => {
    e.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(n))}`);
  }, s = (i, n) => {
    n != null && (Array.isArray(n) ? n.forEach((o) => s(i, o)) : typeof n == "object" ? Object.entries(n).forEach(([o, a]) => s(`${i}[${o}]`, a)) : r(i, n));
  };
  return Object.entries(t).forEach(([i, n]) => s(i, n)), e.length ? `?${e.join("&")}` : "";
}, $ = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (n, o) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(o) ? r(String(e.path[o])) : n;
  }), i = t.BASE + s;
  return e.query ? i + V(e.query) : i;
}, G = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, i) => {
      b(i) || T(i) ? e.append(s, i) : e.append(s, JSON.stringify(i));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, i]) => {
      Array.isArray(i) ? i.forEach((n) => r(s, n)) : r(s, i);
    }), e;
  }
}, v = async (t, e) => typeof e == "function" ? e(t) : e, F = async (t, e) => {
  const [r, s, i, n] = await Promise.all([
    v(e, t.TOKEN),
    v(e, t.USERNAME),
    v(e, t.PASSWORD),
    v(e, t.HEADERS)
  ]), o = Object.entries({
    Accept: "application/json",
    ...n,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [l, c]) => ({
    ...a,
    [l]: String(c)
  }), {});
  if (E(r) && (o.Authorization = `Bearer ${r}`), E(s) && E(i)) {
    const a = H(`${s}:${i}`);
    o.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? o["Content-Type"] = e.mediaType : T(e.body) ? o["Content-Type"] = e.body.type || "application/octet-stream" : b(e.body) ? o["Content-Type"] = "text/plain" : B(e.body) || (o["Content-Type"] = "application/json")), new Headers(o);
}, W = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : b(t.body) || T(t.body) || B(t.body) ? t.body : JSON.stringify(t.body);
}, K = async (t, e, r, s, i, n, o) => {
  const a = new AbortController();
  let l = {
    headers: n,
    body: s ?? i,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (l.credentials = t.CREDENTIALS);
  for (const c of t.interceptors.request._fns)
    l = await c(l);
  return o(() => a.abort()), await fetch(r, l);
}, z = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (b(r))
      return r;
  }
}, J = async (t) => {
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
}, X = (t, e) => {
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
    throw new g(t, e, s);
  if (!e.ok) {
    const i = e.status ?? "unknown", n = e.statusText ?? "unknown", o = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new g(
      t,
      e,
      `Generic Error: status: ${i}; status text: ${n}; body: ${o}`
    );
  }
}, A = (t, e) => new U(async (r, s, i) => {
  try {
    const n = $(t, e), o = G(e), a = W(e), l = await F(t, e);
    if (!i.isCancelled) {
      let c = await K(t, e, n, a, o, l, i);
      for (const q of t.interceptors.response._fns)
        c = await q(c);
      const N = await J(c), x = z(c, e.responseHeader), _ = {
        url: n,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: x ?? N
      };
      X(e, _), r(_.body);
    }
  } catch (n) {
    s(n);
  }
});
class P {
  /**
  * @returns string Success
  * @throws ApiError
  */
  static postUmbracoBlockpreviewApiV1PreviewGridMarkup(e = {}) {
    const { pageKey: r, blockEditorAlias: s, culture: i, requestBody: n } = e;
    return A(u, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewGridMarkup",
      query: {
        pageKey: r,
        blockEditorAlias: s,
        culture: i
      },
      body: n,
      mediaType: "application/json"
    });
  }
  /**
  * @returns string Success
  * @throws ApiError
  */
  static postUmbracoBlockpreviewApiV1PreviewListMarkup(e = {}) {
    const { pageKey: r, blockEditorAlias: s, culture: i, requestBody: n } = e;
    return A(u, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewListMarkup",
      query: {
        pageKey: r,
        blockEditorAlias: s,
        culture: i
      },
      body: n,
      mediaType: "application/json"
    });
  }
}
var p;
class Q {
  constructor(e) {
    y(this, p, void 0);
    m(this, p, e);
  }
  async previewGridMarkup(e, r, s, i) {
    return await S(d(this, p), P.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageKey: e, blockEditorAlias: r, culture: s, requestBody: JSON.stringify(i) }));
  }
  async previewListMarkup(e, r, s, i) {
    return await S(d(this, p), P.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageKey: e, blockEditorAlias: r, culture: s, requestBody: i }));
  }
}
p = new WeakMap();
var h;
class Y extends j {
  constructor(r) {
    super(r);
    y(this, h, void 0);
    m(this, h, new Q(this));
  }
  async previewGridMarkup(r, s, i, n) {
    return await d(this, h).previewGridMarkup(r, s, i, n);
  }
  async previewListMarkup(r, s, i, n) {
    return await d(this, h).previewListMarkup(r, s, i, n);
  }
}
h = new WeakMap();
var f, w;
class R extends j {
  constructor(r) {
    super(r);
    y(this, f, void 0);
    y(this, w, void 0);
    m(this, w, new I("")), this.markup = d(this, w).asObservable(), m(this, f, new Y(this));
  }
  async previewGridMarkup(r, s, i, n) {
    const { data: o } = await d(this, f).previewGridMarkup(r, s, i, n);
    return o || "";
  }
  async previewListMarkup(r, s, i, n) {
    const { data: o } = await d(this, f).previewListMarkup(r, s, i, n);
    return o || "";
  }
}
f = new WeakMap(), w = new WeakMap();
const O = new D("BlockPreviewContext"), Z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BLOCK_PREVIEW_CONTEXT: O,
  BlockPreviewContext: R,
  default: R
}, Symbol.toStringTag, { value: "Module" })), ee = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview context",
    js: () => Promise.resolve().then(() => Z)
  }
], te = [...ee], re = {
  type: "blockEditorCustomView",
  alias: "BlockPreview.CustomView",
  name: "BlockPreview",
  element: () => import("./block-preview.custom-view-BHFmYyE8.js")
}, se = [re], de = (t, e) => {
  e.registerMany([
    ...te,
    ...se
  ]), t.consumeContext(M, async (r) => {
    if (!r)
      return;
    const s = r.getOpenApiConfiguration();
    u.BASE = s.base, u.TOKEN = s.token, u.WITH_CREDENTIALS = s.withCredentials, u.CREDENTIALS = s.credentials;
  }), t.provideContext(O, new R(t));
};
export {
  O as B,
  de as o
};
//# sourceMappingURL=index-eadDpftm.js.map
