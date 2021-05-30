import NetworkError from "../NetworkError";

export default function xhrAdapter(
  requestType,
  url,
  body,
  headers,
  _,
  withCredentials
) {
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
          const result = JSON.parse(this.text);
          delete this.json;
          return (this.json = result);
        },
        get blob() {
          const result = new Blob([request.response], {
            type: contentType,
          });
          delete this.blob;
          return (this.blob = result);
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
