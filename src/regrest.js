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

const ENVIRONMENTS = Object.freeze({ BROWSER: 0, NODE: 1, UNKNOWN: 2 });

// Detect whether instance is ran in browser or on node js
const ENV =
  typeof window === "object" && typeof window.document === "object"
    ? ENVIRONMENTS.BROWSER
    : typeof module === "object" && module && typeof module.exports === "object"
    ? ENVIRONMENTS.NODE
    : ENVIRONMENTS.UNKNOWN;

class NetworkError extends Error {
  constructor(message, request, response) {
    super(message);
    this.name = this.constructor.name;
    this.response = response;
    this.request = request;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

function Regrest() {
  switch (ENV) {
    case ENVIRONMENTS.BROWSER:
      this.requestAdapter = xhrAdapter.bind(this);
      break;
    case ENVIRONMENTS.NODE:
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
Regrest.prototype.request = function ({
  method = "GET",
  url,
  headers = {},
  params,
  data = null,
  maxRedirects = 5,
  withCredentials = false,
}) {
  // Generate query string and join it with url
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
};

// Convenience methods
/**
 * @param {string} url - The url
 * @param {Config} [config] - Config
 * @returns {Promise<Response>}
 * @memberof Regrest
 */
["get", "head", "delete", "options"].forEach(
  (method) =>
    (Regrest.prototype[method] = function (url, config) {
      return this.request({ ...config, method: method.toUpperCase(), url });
    })
);

/**
 * @param {string} url - The url
 * @param {*} [data] - The data to be sent
 * @param {Config} [config] - Config
 * @returns {Promise<Response>}
 * @memberof Regrest
 */
["post", "put", "patch"].forEach(
  (method) =>
    (Regrest.prototype[method] = function (url, data, config) {
      return this.request({
        ...config,
        method: method.toUpperCase(),
        url,
        data,
      });
    })
);

// Export
if (
  typeof module === "object" &&
  module &&
  typeof module.exports === "object"
) {
  /**
   * Expose Regrest as module.exports in loaders
   * that implement the Node module pattern (including browserify)
   */
  module.exports = new Regrest();
} else {
  // Otherwise expose Regrest to the global object
  window.regrest = new Regrest();
}

// Unexposed helper methods and adapters
function xhrAdapter(requestType, url, body, headers, _, withCredentials) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(requestType, url, true);
    Object.entries(headers).forEach(([key, value]) =>
      request.setRequestHeader(key, value)
    );
    withCredentials && (request.withCredentials = true);
    request.onload = function () {
      const contentType = (this.getResponseHeader("Content-Type") || "")
        .split(";")[0]
        .trim();
      const response = {
        status: this.status,
        statusText: this.statusText,
        headers: {
          ...this.getAllResponseHeaders()
            .trim()
            .split(/[\r\n]+/)
            .map((header) => header.split(": "))
            .reduce(
              (obj, [key, value]) => ({ ...obj, [key.toLowerCase()]: value }),
              {}
            ),
        },
        text: this.responseText,
        get json() {
          delete this.json;
          return (this.json = JSON.parse(this.text));
        },
        get blob() {
          delete this.blob;
          return (this.blob = new Blob([request.response], {
            type: contentType,
          }));
        },
        get arrayBuffer() {
          delete this.arrayBuffer;
          return (this.arrayBuffer = this.blob);
        },
      };
      if (this.status >= 200 && this.status < 400) {
        resolve(response);
      } else {
        reject(
          new NetworkError(
            `${this.status} ${this.statusText}`,
            request,
            response
          )
        );
      }
    };
    request.onerror = function () {
      reject(new NetworkError("connection error", request));
    };
    request.send(body);
  });
}

function httpAdapter(requestType, url, body, headers, maxRedirects) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      host: parsedUrl.host,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: requestType,
      headers,
      maxRedirects,
    };
    const req = this.nodeAdapters[parsedUrl.protocol.slice(0, -1)].request(
      options,
      (res) => {
        const response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          arrayBuffer: [],
          get text() {
            delete this.text;
            return (this.text = this.arrayBuffer.toString("utf-8"));
          },
          get json() {
            delete this.json;
            return (this.json = JSON.parse(this.text));
          },
          get blob() {
            if (typeof Blob !== "function") {
              throw new Error("Please include Blob polyfill for Node.js");
            }
            const contentType = this.headers["content-type"] || "";
            delete this.blob;
            return (this.blob = new Blob([new Uint8Array(this.arrayBuffer)], {
              type: contentType.split(";")[0].trim(),
            }));
          },
        };
        res.on("data", (chunk) => response.arrayBuffer.push(chunk));
        res.on("end", () => {
          response.arrayBuffer = Buffer.concat(response.arrayBuffer);
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(response);
          } else {
            reject(
              new NetworkError(
                `${res.statusCode} ${res.statusMessage}`,
                req,
                response
              )
            );
          }
        });
      }
    );
    req.on("error", (e) => reject(new NetworkError(e.message, req)));
    body && req.write(body);
    req.end();
  });
}
