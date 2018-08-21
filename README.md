# Regrest - Micro HTTP client

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Micro Promise based HTTP client for the browser and node.js

## Features

- Make [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
- Make [http](http://nodejs.org/api/http.html) requests from node.js
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API

## Super simple to use

Regrest is designed to be the simplest way possible to make http calls

```js
const regrest = require("regrest");

// Use Promise
regrest
  .get("http://www.google.com")
  .then(response => console.log(response)) // Print the HTML for Google homepage
  .catch(error => console.log(`*** Error: ${error}`)); // Print any error if occurred

// Or use the new async/await keywords
try {
  const response = await regrest.get("http://www.google.com"); // Store the response in a variable
  console.log(response); // print out the response
} catch (error) {
  console.log(`*** Error: ${error}`); // Print any error if occurred
}

// Or use callbacks
// WE DON'T DO THAT HERE
```

## Documentation

Regrest is also designed to be self-documenting, here are the provided convenience methods

```js
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
```
