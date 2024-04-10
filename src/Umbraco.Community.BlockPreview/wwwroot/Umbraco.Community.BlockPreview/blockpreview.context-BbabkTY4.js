var _ = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var d = (t, e, r) => (_(t, e, "read from private field"), r ? r.call(t) : e.get(t)), y = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, m = (t, e, r, s) => (_(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r);
import { UmbControllerBase as j } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as q } from "@umbraco-cms/backoffice/context-api";
import { tryExecuteAndNotify as C } from "@umbraco-cms/backoffice/resources";
import { UMB_AUTH_CONTEXT as B } from "@umbraco-cms/backoffice/auth";
import { UmbStringState as x } from "@umbraco-cms/backoffice/observable-api";
class S extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class D extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class I {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const i = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(o));
      }, n = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(o));
      }, a = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(o);
      };
      return Object.defineProperty(a, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(a, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(a, "isCancelled", {
        get: () => this._isCancelled
      }), e(i, n, a);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new D("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class g {
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
const E = {
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
    request: new g(),
    response: new g()
  }
}, w = (t) => typeof t == "string", R = (t) => w(t) && t !== "", T = (t) => t instanceof Blob, N = (t) => t instanceof FormData, L = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, U = (t) => {
  const e = [], r = (i, n) => {
    e.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(n))}`);
  }, s = (i, n) => {
    n != null && (Array.isArray(n) ? n.forEach((a) => s(i, a)) : typeof n == "object" ? Object.entries(n).forEach(([a, o]) => s(`${i}[${a}]`, o)) : r(i, n));
  };
  return Object.entries(t).forEach(([i, n]) => s(i, n)), e.length ? `?${e.join("&")}` : "";
}, H = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (n, a) => {
    var o;
    return (o = e.path) != null && o.hasOwnProperty(a) ? r(String(e.path[a])) : n;
  }), i = t.BASE + s;
  return e.query ? i + U(e.query) : i;
}, G = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, i) => {
      w(i) || T(i) ? e.append(s, i) : e.append(s, JSON.stringify(i));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, i]) => {
      Array.isArray(i) ? i.forEach((n) => r(s, n)) : r(s, i);
    }), e;
  }
}, b = async (t, e) => typeof e == "function" ? e(t) : e, V = async (t, e) => {
  const [r, s, i, n] = await Promise.all([
    b(e, t.TOKEN),
    b(e, t.USERNAME),
    b(e, t.PASSWORD),
    b(e, t.HEADERS)
  ]), a = Object.entries({
    Accept: "application/json",
    ...n,
    ...e.headers
  }).filter(([, o]) => o != null).reduce((o, [l, c]) => ({
    ...o,
    [l]: String(c)
  }), {});
  if (R(r) && (a.Authorization = `Bearer ${r}`), R(s) && R(i)) {
    const o = L(`${s}:${i}`);
    a.Authorization = `Basic ${o}`;
  }
  return e.body !== void 0 && (e.mediaType ? a["Content-Type"] = e.mediaType : T(e.body) ? a["Content-Type"] = e.body.type || "application/octet-stream" : w(e.body) ? a["Content-Type"] = "text/plain" : N(e.body) || (a["Content-Type"] = "application/json")), new Headers(a);
}, $ = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : w(t.body) || T(t.body) || N(t.body) ? t.body : JSON.stringify(t.body);
}, F = async (t, e, r, s, i, n, a) => {
  const o = new AbortController();
  let l = {
    headers: n,
    body: s ?? i,
    method: e.method,
    signal: o.signal
  };
  t.WITH_CREDENTIALS && (l.credentials = t.CREDENTIALS);
  for (const c of t.interceptors.request._fns)
    l = await c(l);
  return a(() => o.abort()), await fetch(r, l);
}, W = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (w(r))
      return r;
  }
}, K = async (t) => {
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
}, z = (t, e) => {
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
    throw new S(t, e, s);
  if (!e.ok) {
    const i = e.status ?? "unknown", n = e.statusText ?? "unknown", a = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new S(
      t,
      e,
      `Generic Error: status: ${i}; status text: ${n}; body: ${a}`
    );
  }
}, A = (t, e) => new I(async (r, s, i) => {
  try {
    const n = H(t, e), a = G(e), o = $(e), l = await V(t, e);
    if (!i.isCancelled) {
      let c = await F(t, e, n, o, a, l, i);
      for (const M of t.interceptors.response._fns)
        c = await M(c);
      const P = await K(c), O = W(c, e.responseHeader), v = {
        url: n,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: O ?? P
      };
      z(e, v), r(v.body);
    }
  } catch (n) {
    s(n);
  }
});
class k {
  /**
   * @returns string Success
   * @throws ApiError
   */
  static postUmbracoBlockpreviewApiV1PreviewGridMarkup(e = {}) {
    const {
      pageId: r,
      blockEditorAlias: s,
      culture: i,
      requestBody: n
    } = e;
    return A(E, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewGridMarkup",
      query: {
        pageId: r,
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
    const {
      pageId: r,
      blockEditorAlias: s,
      culture: i,
      requestBody: n
    } = e;
    return A(E, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewListMarkup",
      query: {
        pageId: r,
        blockEditorAlias: s,
        culture: i
      },
      body: n,
      mediaType: "application/json"
    });
  }
}
var h;
class J {
  constructor(e) {
    y(this, h, void 0);
    m(this, h, e);
  }
  async previewGridMarkup(e, r, s, i) {
    return await C(d(this, h), k.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageId: e, blockEditorAlias: r, culture: s, requestBody: i }));
  }
  async previewListMarkup(e, r, s, i) {
    return await C(d(this, h), k.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageId: e, blockEditorAlias: r, culture: s, requestBody: i }));
  }
}
h = new WeakMap();
var p;
class X extends j {
  constructor(r) {
    super(r);
    y(this, p, void 0);
    m(this, p, new J(this));
  }
  async previewGridMarkup(r, s, i, n) {
    return await d(this, p).previewGridMarkup(r, s, i, n);
  }
  async previewListMarkup(r, s, i, n) {
    return await d(this, p).previewListMarkup(r, s, i, n);
  }
}
p = new WeakMap();
var f, u;
class Q extends j {
  constructor(r) {
    super(r);
    y(this, f, void 0);
    y(this, u, void 0);
    m(this, u, new x("")), this.markup = d(this, u).asObservable(), this.provideContext(Y, this), m(this, f, new X(this)), this.consumeContext(B, (s) => {
      E.TOKEN = () => s.getLatestToken(), E.WITH_CREDENTIALS = !0;
    });
  }
  async previewGridMarkup(r, s, i, n) {
    const { data: a } = await d(this, f).previewGridMarkup(r, s, i, n);
    a && d(this, u).setValue(a);
  }
  async previewListMarkup(r, s, i, n) {
    const { data: a } = await d(this, f).previewListMarkup(r, s, i, n);
    a && d(this, u).setValue(a);
  }
}
f = new WeakMap(), u = new WeakMap();
const Y = new q(Q.name);
export {
  Y as BLOCKPREVIEW_MANAGEMENT_CONTEXT_TOKEN,
  Q as BlockPreviewManagementContext,
  Q as default
};
//# sourceMappingURL=blockpreview.context-BbabkTY4.js.map
