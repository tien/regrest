(window => {
  const ENVIRONMENTS = Object.freeze({ BROWSER: 0, NODE: 1, UNKNOWN: 2 });

  // Detect whether instance is ran in browser or on node js
  const ENV =
    typeof window === "object" && typeof window.document === "object"
      ? ENVIRONMENTS.BROWSER
      : typeof module === "object" &&
        module &&
        typeof module.exports === "object"
        ? ENVIRONMENTS.NODE
        : ENVIRONMENTS.UNKNOWN;

  class NetworkError extends Error {
    constructor(message, status, statusText, headers) {
      super(message);
      this.name = this.constructor.name;
      this.response =
        status !== undefined || statusText !== undefined
          ? { status, statusText, headers }
          : null;
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
   * @param {Object.<string, *>} config - Config
   * @param {string} [config.method = "GET"] - HTTP request method
   * @param {string} config.url - The url
   * @param {Object.<string, string>} [config.headers = {}] - The request headers
   * @param {Object.<string, *>} [config.params] - The request query
   * @param {*} [config.data = null] - The data to be sent
   * @param {number} [config.maxRedirects = 5] - Maximum redirects before error is thrown
   * @returns {Promise}
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
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.get = function(url, config) {
    return this.request({ ...config, url });
  };

  /**
   * @param {string} url - The url
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.head = function(url, config) {
    return this.request({ ...config, method: "HEAD", url });
  };

  /**
   * @param {string} url - The url
   * @param {*} [data] - The data to be sent
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.post = function(url, data, config) {
    return this.request({ ...config, method: "POST", url, data });
  };

  /**
   * @param {string} url - The url
   * @param {*} [data] - The data to be sent
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.put = function(url, data, config) {
    return this.request({ ...config, method: "PUT", url, data });
  };

  /**
   * @param {string} url - The url
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.delete = function(url, config) {
    return this.request({ ...config, method: "DELETE", url });
  };

  /**
   * @param {string} url - The url
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
   * @memberof Regrest
   */
  Regrest.prototype.options = function(url, config) {
    return this.request({ ...config, method: "OPTIONS", url });
  };

  /**
   * @param {string} url - The url
   * @param {*} [data] - The data to be sent
   * @param {Object.<string, *>} [config] - Config
   * @returns {Promise}
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
        const headers = {
          ...this.getAllResponseHeaders()
            .trim()
            .split(/[\r\n]+/)
            .map(header => header.split(": "))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        };
        if (this.status >= 200 && this.status < 400) {
          resolve({
            status: this.status,
            statusText: this.statusText,
            headers,
            text: this.responseText,
            get json() {
              return JSON.parse(this.text);
            }
          });
        } else {
          reject(
            new NetworkError(
              `${this.status} ${this.statusText}`,
              this.status,
              this.statusText,
              headers
            )
          );
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
        headers: headers,
        maxRedirects: maxRedirects
      };
      const req = this.nodeAdapters[parsedUrl.protocol.slice(0, -1)].request(
        options,
        res => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            let rawData = "";
            res.setEncoding("utf8");
            res.on("data", chunk => (rawData += chunk));
            res.on("end", () =>
              resolve({
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                text: rawData,
                get json() {
                  return JSON.parse(rawData);
                }
              })
            );
          } else {
            reject(
              new NetworkError(
                `${res.statusCode} ${res.statusMessage}`,
                res.statusCode,
                res.statusMessage,
                res.headers
              )
            );
          }
        }
      );
      req.on("error", e => reject(new NetworkError(e)));
      body && req.write(body);
      req.end();
    });
  }
})(this);
