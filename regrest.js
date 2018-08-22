"use strict";

(window => {
  const ENVIRONMENTS = Object.freeze({ BROWSER: 0, NODE: 1, UNKNOWN: 2 });

  // Detect whether instance is ran in browser or on node js
  const ENV =
    typeof window === "object" && typeof window.document === "object"
      ? ENVIRONMENTS.BROWSER
      : typeof process === "object" && process.versions && process.versions.node
        ? ENVIRONMENTS.NODE
        : ENVIRONMENTS.UNKNOWN;

  function Regrest() {
    switch (ENV) {
      case ENVIRONMENTS.BROWSER:
        this.requestAdapter = browserRequest.bind(this);
        break;
      case ENVIRONMENTS.NODE:
        this.nodeAdapters = {
          http: require("http"),
          https: require("https")
        };
        this.requestAdapter = nodeRequest.bind(this);
        break;
      default:
        throw "Unsupported environment";
    }
  }

  Regrest.prototype.request = function({
    method = "GET",
    url,
    headers = {},
    params,
    data = null
  }) {
    // Generate query string and join it with url
    url = `${url}${
      params
        ? `?${Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")}`
        : ""
    }`;
    return this.requestAdapter(method, url, data, headers);
  };

  // Convenience methods
  Regrest.prototype.get = function(url, config) {
    return this.request({ ...config, url });
  };

  Regrest.prototype.head = function(url, config) {
    return this.request({ ...config, method: "HEAD", url });
  };

  Regrest.prototype.post = function(url, data, config) {
    return this.request({ ...config, method: "POST", url, data });
  };

  Regrest.prototype.put = function(url, data, config) {
    return this.request({ ...config, method: "PUT", url, data });
  };

  Regrest.prototype.delete = function(url, config) {
    return this.request({ ...config, method: "DELETE", url });
  };

  Regrest.prototype.options = function(url, config) {
    return this.request({ ...config, method: "OPTIONS", url });
  };

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
      Object.entries(headers).forEach(header => {
        request.setRequestHeader(header[0], header[1]);
      });
      request.onload = function() {
        this.status >= 200 && this.status < 400
          ? resolve({
              status: this.status,
              statusText: this.statusText,
              text: this.response,
              get json() {
                return his.getAllResponseHeaders();
              }
            })
          : reject(`${this.status} ${this.statusText}`);
      };
      request.onerror = function() {
        reject(new Error("connection error"));
      };
      request.send(body);
    });
  }

  function nodeRequest(requestType, url, body, headers) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        host: parsedUrl.host,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: requestType,
        headers: headers
      };
      const req = this.nodeAdapters[parsedUrl.protocol.slice(0, -1)].request(
        options,
        res => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            let rawData = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
              rawData += chunk;
            });
            res.on("end", () => {
              resolve({
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                text: rawData,
                get json() {
                  return JSON.parse(rawData);
                }
              });
            });
          } else {
            reject(`${res.statusCode} ${res.statusMessage}`);
          }
        }
      );
      req.on("error", e => reject(e));
      body && req.write(body);
      req.end();
    });
  }

  function prepareResponse(rawData, status, statusText, headers) {
    return {
      status,
      statusText,
      headers,
      text: rawData,
      get json() {
        return JSON.parse(rawData);
      }
    };
  }
})(this);
