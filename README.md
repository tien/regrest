# 🚀 Regrest - Micro HTTP client

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/regrest.svg)](https://badge.fury.io/js/regrest)
[![](https://img.shields.io/badge/gzip%20size-8%20kB-44cc11.svg)](https://cdn.jsdelivr.net/npm/regrest/build/regrest.min.js)
[![install size](https://packagephobia.now.sh/badge?p=regrest)](https://packagephobia.now.sh/result?p=regrest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Micro Promise based HTTP client for the browser and node.js

## ✨ Features

- Make [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
- Make [http](http://nodejs.org/api/http.html) requests from node.js
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
- Built in [TypeScript](https://www.typescriptlang.org/) support

## 👍🏻 Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 11 ✔ |

### NOTE

If you intend to support Internet Explorer, be sure to have a [poly-fill](https://github.com/taylorhakes/promise-polyfill) that adds a global `Promise` object

## 🏗 Installing

Using npm:

```bash
$ npm install regrest
```

Using cdn:

```html
<script src="https://cdn.jsdelivr.net/npm/regrest/build/regrest.min.js"></script>
```

## 🎬 Example

Regrest is designed to be the simplest way possible to make http calls

Performing a `GET` request

```js
// Import using NodeJS or CommonJS module
const regrest = require("regrest");
// Or using ES6 module
import regrest from "regrest"
// Without synthetic default imports (e.g. TypeScript)
import * as regrest from "regrest"

// Use Promise
regrest
  .get("/man/bear/pig")
  // Print the raw response string
  .then(response => console.log(response.text))
  // Print any error if occurred
  .catch(error => console.log(`*** Error: ${error}`));

// Or use the new async/await keywords
const getGood = async () => {
  try {
    // Store the response in a variable
    const response = await regrest.get("/foo/bar.json");
    // print out the parsed response
    console.log(response.json);
  } catch (error) {
    // Print any error if occurred
    console.log(`*** Error: ${error}`);
  }
};

getGood();

// Or use callbacks
// WE DON'T DO THAT HERE
```

Performing a `POST` request

```js
regrest
  .post("/comment", JSON.stringify({ name: "Foo", comment: "Bar" }))
  .then(response => console.log(response.status, response.statusText))
  .catch(error => console.log(error));
```

## 📚 Documentation

### Convenience methods

##### regrest.request(config)

##### regrest.get(url[, config])

##### regrest.head(url[, config])

##### regrest.post(url[, data[, config]])

##### regrest.put(url[, data[, config]])

##### regrest.delete(url[, config])

##### regrest.options(url[, config])

##### regrest.patch(url[, data[, config]])

### Config options

```js
// Default options are marked with *
const config = {
  method: "GET", // *GET, POST, PUT, DELETE, etc.
  url: "https://some-domain.com/api/",
  headers: { "Content-Type": "application/json; charset=utf-8" }, // *{}
  params: { UID: 9873 },
  data: JSON.stringify(data), // *null
  maxRedirects: 10, // *5
  withCredentials: true // *false, true
};
```

### Response object attributes

```js
{
  // Contains the status code of the response, e.g. 404 for a not found resource, 200 for a success
  status: 200,
  // A message related to the status attribute, e.g. OK for a status 200
  statusText: "OK",
  // The headers that the server responded with
  headers: {},
  // Response content as a string
  text: "",
  // Response content as JSON
  json: {},
  // Response content as Blob on browser and Buffer on Node js
  arrayBuffer: instance of Blob || instance of ArrayBuffer,
  // Reponse content as Blob
  blob: instance of Blob
};
```

### Errors handling

```js
regrest.get("/McNullington").catch(error => {
  if (error.response) {
    /**
    * A request was made but server responded
    * with status code out of the 2XX range
    * `error.response` is an instance of the response object
    */
    console.log(error.response.status);
    console.log(error.response.statusText);
    console.log(error.response.headers);
    // ...
  } else if (error.request) {
    /**
    * A request was made, but no response was received
    * `error.request` is an instance of XMLHttpRequest on browser and an instance of
    * http.ClientRequest on Node js
    */
    console.log(error.request);
  } else {
    // Something else happened
    console.log(error.message);
  }
});
```
