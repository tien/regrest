import httpAdapter from "./adapters/httpAdapter";
import xhrAdapter from "./adapters/xhrAdapter";
import { Environment } from "./types";

import type { http, https } from "follow-redirects";
import type { Adapter, Options, OptionsWithUrl, Response } from "./types";
import type { PickKey } from "./utils";

const ENV =
  typeof window === "object" && typeof window.document === "object"
    ? Environment.browser
    : typeof module === "object" && module && typeof module.exports === "object"
    ? Environment.node
    : Environment.unknown;

export class Regrest {
  /**
   * @internal
   */
  readonly prototype!: Regrest;

  /**
   * @internal
   */
  readonly requestAdapter: Adapter;

  /**
   * @internal
   */
  readonly nodeAdapters!: { http: typeof http; https: typeof https };

  constructor() {
    switch (ENV) {
      case Environment.browser:
        this.requestAdapter = xhrAdapter.bind(this);
        break;
      case Environment.node:
        this.nodeAdapters = {
          http: require("follow-redirects").http,
          https: require("follow-redirects").https,
        };
        this.requestAdapter = httpAdapter.bind(this);
        break;
      default:
        throw new Error("Unsupported environment");
    }
  }

  request({
    method = "GET",
    url,
    headers = {},
    params,
    data = null,
    maxRedirects = 5,
    withCredentials = false,
  }: OptionsWithUrl) {
    url = `${url}${
      params
        ? `?${Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")}`
        : ""
    }`;
    return this.requestAdapter(
      method,
      url,
      data,
      headers,
      maxRedirects,
      withCredentials
    );
  }

  get!: (url: string, options?: Options) => Promise<Response>;
  delete!: (url: string, options?: Options) => Promise<Response>;
  head!: (url: string, options?: Options) => Promise<Response>;
  options!: (url: string, options?: Options) => Promise<Response>;
  post!: (url: string, data?: any, options?: Options) => Promise<Response>;
  put!: (url: string, data?: any, options?: Options) => Promise<Response>;
  patch!: (url: string, data?: any, options?: Options) => Promise<Response>;
}

type Verb = PickKey<Regrest, "get" | "head" | "delete" | "options">;
type VerbWithData = PickKey<Regrest, "post" | "put" | "patch">;

(<Verb[]>["get", "head", "delete", "options"]).forEach(
  (method) =>
    (Regrest.prototype[method] = function (url, options) {
      return this.request({ ...options, method: method.toUpperCase(), url });
    })
);

(<VerbWithData[]>["post", "put", "patch"]).forEach(
  (method) =>
    (Regrest.prototype[method] = function (url, data, options) {
      return this.request({
        ...options,
        method: method.toUpperCase(),
        url,
        data,
      });
    })
);

export default Regrest;
