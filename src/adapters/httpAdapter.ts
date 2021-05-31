import NetworkError from "../NetworkError";

import type { Regrest } from "../Regrest";
import type { Adapter, Response } from "../types";

const httpAdapter: Adapter = function (
  requestType,
  url,
  body,
  headers,
  maxRedirects
) {
  return new Promise<Response>((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      host: parsedUrl.host,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: requestType,
      headers,
      maxRedirects,
    };
    const req = this.nodeAdapters[
      parsedUrl.protocol.slice(
        0,
        -1
      ) as keyof typeof Regrest["prototype"]["nodeAdapters"]
    ].request(options, (res) => {
      const chunks: any[] = [];
      const response = {
        status: res.statusCode ?? 0,
        statusText: res.statusMessage ?? "",
        headers: res.headers,
        arrayBuffer: Buffer.from([]),
        get text() {
          const result = this.arrayBuffer.toString("utf-8");
          delete this.text;
          return (this.text = result);
        },
        get json() {
          const result = JSON.parse(this.text);
          delete this.json;
          return (this.json = result);
        },
        get blob() {
          if (Blob === undefined) {
            throw new Error("Please include Blob polyfill for Node.js");
          }
          const contentType = this.headers["content-type"] || "";
          const result = new Blob([new Uint8Array(this.arrayBuffer)], {
            type: contentType.split(";")[0].trim(),
          });
          delete this.blob;
          return (this.blob = result);
        },
      };
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        response.arrayBuffer = Buffer.concat(chunks);
        if (
          res.statusCode !== undefined &&
          res.statusCode >= 200 &&
          res.statusCode < 400
        ) {
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
    });
    req.on("error", (e) => reject(new NetworkError(e.message, req)));
    body && req.write(body);
    req.end();
  });
};

export default httpAdapter;
