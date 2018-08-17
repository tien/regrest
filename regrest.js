function Regrest() {
  this.modes = Object.freeze({ browser: "browser", node: "node" });
  if (typeof XMLHttpRequest !== "undefined") {
    this.mode = this.modes.browser;
  } else if (typeof require("http") !== "undefined") {
    this.mode = this.modes.node;
    this.http = require("https");
  }
  this.defaultHeader = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
}

Regrest.prototype.request = function(requestType, url, body = null, cusHeader) {
  cusHeader = cusHeader || this.defaultHeader;
  return new Promise((resolve, reject) => {
    switch (this.mode) {
      case this.modes.browser:
        const request = new XMLHttpRequest();
        request.open(requestType, url, true);
        Object.entried(cusHeader).forEach(header => {
          request.setRequestHeader(header[0], header[1]);
        });
        request.onload = function() {
          this.status >= 200 && this.status < 400
            ? resolve(this.response)
            : reject(this.response);
        };
        request.send(body);
        break;
      case this.modes.node:
        const parsedUrl = new URL(url);
        const options = {
          host: parsedUrl.host,
          path: parsedUrl.pathname,
          method: requestType,
          header: cusHeader
        };
        const req = this.http.request(options, res => {
          let rawData = "";
          res.setEncoding("utf8");
          res.on("data", chunk => {
            rawData += chunk;
          });
          res.on("end", () => {
            resolve(rawData);
          });
        });
        req.on("error", e => reject(e));
        body && req.write(body);
        req.end();
        break;
    }
  });
};

Regrest.prototype.get = function(url, cusHeader) {
  return this.request("GET", url, null, cusHeader);
};

Regrest.prototype.post = function(url, data, cusHeader) {
  return this.request("POST", url, data, cusHeader);
};

module.exports = new Regrest();
