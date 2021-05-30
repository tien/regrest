export default class NetworkError extends Error {
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
