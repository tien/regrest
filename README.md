# Regrest - Micro HTTP client

- A tiny promise based HTTP client
- Work on Node js using http module
- Work on any browser that support XMLHttpRequest

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
