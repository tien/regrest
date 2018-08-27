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
    constructor(message, statusCode, statusText, headers) {
      super(message);
      this.name = this.constructor.name;
      this.response =
        statusCode !== undefined || statusText !== undefined
          ? { statusCode, statusText, headers }
          : null;
      this.request = true;
      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error(message).stack;
      }
    }
  }

  class Regrest {
    constructor() {
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
          throw new NetworkError("Unsupported environment");
      }
    }

    request({ method = "GET", url, headers = {}, params, data = null }) {
      // Generate query string and join it with url
      url = `${url}${
        params
          ? `?${Object.entries(params)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")}`
          : ""
      }`;
      return this.requestAdapter(method, url, data, headers);
    }

    // Convenience methods
    get(url, config) {
      return this.request({ ...config, url });
    }
    head(url, config) {
      return this.request({ ...config, method: "HEAD", url });
    }
    post(url, data, config) {
      return this.request({ ...config, method: "POST", url, data });
    }
    put(url, data, config) {
      return this.request({ ...config, method: "PUT", url, data });
    }
    delete(url, config) {
      return this.request({ ...config, method: "DELETE", url });
    }
    options(url, config) {
      return this.request({ ...config, method: "OPTIONS", url });
    }
    patch(url, data, config) {
      return this.request({ ...config, method: "PATCH", url, data });
    }
  }

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
            .map(([key, value]) => ({ [key]: value }))
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
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
