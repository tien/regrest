/**
 * Config options
 * @typedef {Object.<string, *>} Config
 * @property {string} [method = "GET"] - HTTP request method
 * @property {string} url - The url
 * @property {Object.<string, string>} [headers = {}] - The request headers
 * @property {Object.<string, *>} [propertys] - The request query
 * @property {*} [data = null] - The data to be sent
 * @property {number} [maxRedirects = 5] - Maximum redirects before error is thrown
 *
 * Regrest response object
 * @typedef {Object.<string, *>} Response
 * @property {number} status - The response status code
 * @property {string} statusText - The response status text
 * @property {Object.<string, string>} headers - The response headers
 * @property {string} text - The response raw text
 * @property {Object} json - The response parsed as JSON
 *
 * Regrest error object
 * @typedef {Object.<string, *>} NetworkError
 * @property {string} name - Name of the error
 * @property {Response} response - The response object
 * @property {boolean} request - Boolean indicating whether a request was succesfully made
 * @property {string} stack - Error stack trace
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
  constructor(message, response) {
    super(message);
    this.name = this.constructor.name;
    this.response = response;
    this.request = true;
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
      this.requestAdapter = browserRequest.bind(this);
      break;
    case ENVIRONMENTS.NODE:
      this.nodeAdapters = {
        http: require("follow-redirects").http,
        https: require("follow-redirects").https
      };
      this.requestAdapter = nodeRequest.bind(this);
      break;
    default:
      throw new NetworkError("Unsupported environment");
  }
}

/**
 * @param {Config} config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.request = function({
  method = "GET",
  url,
  headers = {},
  params,
  data = null,
  maxRedirects = 5
}) {
  // Generate query string and join it with url
  url = `${url}${
    params
      ? `?${Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")}`
      : ""
  }`;
  return this.requestAdapter(method, url, data, headers, maxRedirects);
};

// Convenience methods
/**
 * @param {string} url - The url
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.get = function(url, config) {
  return this.request({ ...config, url });
};

/**
 * @param {string} url - The url
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.head = function(url, config) {
  return this.request({ ...config, method: "HEAD", url });
};

/**
 * @param {string} url - The url
 * @param {*} [data] - The data to be sent
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.post = function(url, data, config) {
  return this.request({ ...config, method: "POST", url, data });
};

/**
 * @param {string} url - The url
 * @param {*} [data] - The data to be sent
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.put = function(url, data, config) {
  return this.request({ ...config, method: "PUT", url, data });
};

/**
 * @param {string} url - The url
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.delete = function(url, config) {
  return this.request({ ...config, method: "DELETE", url });
};

/**
 * @param {string} url - The url
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.options = function(url, config) {
  return this.request({ ...config, method: "OPTIONS", url });
};

/**
 * @param {string} url - The url
 * @param {*} [data] - The data to be sent
 * @param {Config} [config] - Config
 * @returns {Promise<Response, NetworkError>}
 * @memberof Regrest
 */
Regrest.prototype.patch = function(url, data, config) {
  return this.request({ ...config, method: "PATCH", url, data });
};

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
function browserRequest(requestType, url, body, headers) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(requestType, url, true);
    Object.entries(headers).forEach(([key, value]) =>
      request.setRequestHeader(key, value)
    );
    request.onload = function() {
      const response = {
        status: this.status,
        statusText: this.statusText,
        headers: {
          ...this.getAllResponseHeaders()
            .trim()
            .split(/[\r\n]+/)
            .map(header => header.split(": "))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        },
        text: this.responseText,
        get json() {
          return JSON.parse(this.text);
        }
      };
      if (this.status >= 200 && this.status < 400) {
        resolve(response);
      } else {
        reject(new NetworkError(`${this.status} ${this.statusText}`, response));
      }
    };
    request.onerror = function() {
      reject(new NetworkError("connection error"));
    };
    request.send(body);
  });
}

function nodeRequest(requestType, url, body, headers, maxRedirects) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      host: parsedUrl.host,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: requestType,
      headers,
      maxRedirects
    };
    const req = this.nodeAdapters[parsedUrl.protocol.slice(0, -1)].request(
      options,
      res => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", chunk => (text += chunk));
        res.on("end", () => {
          const response = {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            get text() {
              return text;
            },
            get json() {
              return JSON.parse(text);
            }
          };
          if (res.statusCode >= 200 && res.statusCode < 400) {
            return resolve(response);
          } else {
            reject(
              new NetworkError(
                `${res.statusCode} ${res.statusMessage}`,
                response
              )
            );
          }
        });
      }
    );
    req.on("error", e => reject(new NetworkError(e)));
    body && req.write(body);
    req.end();
  });
}
