# Regrest - Micro HTTP client

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Micro Promise based HTTP client for the browser and node.js

## Features

- Make [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
- Make [http](http://nodejs.org/api/http.html) requests from node.js
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API

## Installing

Using npm:

```bash
$ npm install regrest
```

Using cdn:

```html
<script src="https://unpkg.com/regrest@2.0.1/regrest.js"></script>
```

## Example

Regrest is designed to be the simplest way possible to make http calls

Performing a `GET` request

```js
const regrest = require("regrest");

// Use Promise
regrest
  .get("http://www.google.com")
  // Print the HTML for Google homepage
  .then(response => console.log(response))
  // Print any error if occurred
  .catch(error => console.log(`*** Error: ${error}`));

// Or use the new async/await keywords
const getGoogle = async () => {
  try {
    // Store the response in a variable
    const response = await regrest.get("http://www.google.com");
    // print out the response
    console.log(response);
  } catch (error) {
    // Print any error if occurred
    console.log(`*** Error: ${error}`);
  }
};

// Or use callbacks
// WE DON'T DO THAT HERE
```

Performing a `POST` request

```js
regrest
  .post("/comment", JSON.stringify({ name: "Foo", comment: "Bar" }))
  .then(response => console.log(response))
  .catch(error => console.log(error));
```

## Documentation

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
  data: JSON.stringify(data) // *null
};
```
