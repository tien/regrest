import { Response } from "./types";

export default class NetworkError extends Error {
  constructor(
    message: string,
    public request: any,
    public response?: Response
  ) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
