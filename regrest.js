const ENVIRONMENTS = Object.freeze({ browser: "browser", node: "node" });

// Detect whether instance is ran in browser or on node js
const ENV =
  typeof window !== "undefined" && typeof window.document !== "undefined"
    ? "browser"
    : typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
      ? "node"
      : "unknown ENV";

function Regrest() {
  this.defaultHeader = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (ENV === ENVIRONMENTS.browser) {
    this.mode = ENVIRONMENTS.browser;
  } else if (ENV === ENVIRONMENTS.node) {
    this.mode = ENVIRONMENTS.node;
    this.nodeAdapters = {
      http: require("http"),
      https: require("https")
    };
  } else {
    throw "Unsupported environment";
  }
}

Regrest.prototype.request = function(requestType, url, body, cusHeader) {
  cusHeader = cusHeader || this.defaultHeader;
  switch (this.mode) {
    case ENVIRONMENTS.browser:
      return browserRequest.bind(this)(...arguments);
    case ENVIRONMENTS.node:
      return nodeRequest.bind(this)(...arguments);
  }
};

Regrest.prototype.get = function(url, cusHeader) {
  return this.request("GET", url, null, cusHeader);
};

Regrest.prototype.post = function(url, data, cusHeader) {
  return this.request("POST", url, data, cusHeader);
};

Regrest.prototype.put = function(url, data, cusHeader) {
  return this.request("PUT", url, data, cusHeader);
};

Regrest.prototype.delete = function(url, cusHeader) {
  return this.request("DELETE", url, null, cusHeader);
};

typeof module !== "undefined" && (module.exports = new Regrest())

function browserRequest(requestType, url, body, cusHeader) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(requestType, url, true);
    Object.entries(cusHeader).forEach(header => {
      request.setRequestHeader(header[0], header[1]);
    });
    request.onload = function() {
      this.status >= 200 && this.status < 400
        ? resolve(this.response)
        : reject(`${this.status} ${this.statusText}`);
    };
    request.onerror = function() {
      reject("connection error");
    };
    request.send(body);
  });
}

function nodeRequest(requestType, url, body, cusHeader) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      host: parsedUrl.host,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: requestType,
      headers: cusHeader
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
            resolve(rawData);
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
