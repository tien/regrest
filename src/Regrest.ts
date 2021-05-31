import httpAdapter from "./adapters/httpAdapter";
import xhrAdapter from "./adapters/xhrAdapter";
import { Adapter, Environment } from "./types";

import type { http, https } from "follow-redirects";
import type { Options, OptionsWithUrl, RequestBody } from "./types";

/**
 * Config options
 * @typedef {Object.<string, *>} Config
 * @property {string} [method = "GET"] - HTTP request method
 * @property {string} [url] - The url
 * @property {Object.<string, string>} [headers = {}] - The request headers
 * @property {Object.<string, *>} [params] - The request query
 * @property {*} [data = null] - The data to be sent
 * @property {number} [maxRedirects = 5] - Maximum redirects before error is thrown
 * @property {boolean} [withCredentials = false] - Whether cross-site Access-Control requests should be made using credentials
 *
 * Regrest response object
 * @typedef {Object.<string, *>} Response
 * @property {number} status - The response status code
 * @property {string} statusText - The response status text
 * @property {Object.<string, string>} headers - The response headers
 * @property {string} text - The response raw text
 * @property {Object} json - The response parsed as JSON
 * @property {Blob|any} arrayBuffer - The response as an Blob on browser or Buffer on Node js
 * @property {Blob} blob - The response as a Blob object
 */

const ENV =
  typeof window === "object" && typeof window.document === "object"
    ? Environment.browser
    : typeof module === "object" && module && typeof module.exports === "object"
    ? Environment.node
    : Environment.unknown;

export class Regrest {
  readonly requestAdapter: Adapter;
  readonly nodeAdapters: { http: typeof http; https: typeof https };

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

  /**
   * @param {Config} config
   * @param {string} config.url - The url
   * @returns {Promise<Response>}
   * @memberof Regrest
   */
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
}

/**
 * @param {string} url - The url
 * @param {Options} [config] - Config
 * @returns {Promise<Response>}
 * @memberof Regrest
 */
["get", "head", "delete", "options"].forEach(
  (method) =>
    (Regrest.prototype[method] = function (url: string, config: Options) {
      return this.request({ ...config, method: method.toUpperCase(), url });
    })
);

/**
 * @param {string} url - The url
 * @param {*} [data] - The data to be sent
 * @param {Options} [config] - Config
 * @returns {Promise<Response>}
 * @memberof Regrest
 */
["post", "put", "patch"].forEach(
  (method) =>
    (Regrest.prototype[method] = function (
      url: string,
      data: RequestBody,
      config: Options
    ) {
      return this.request({
        ...config,
        method: method.toUpperCase(),
        url,
        data,
      });
    })
);

export default Regrest;
