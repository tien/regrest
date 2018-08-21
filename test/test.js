const ENVIRONMENTS = Object.freeze({ BROWSER: 0, NODE: 1, UNKNOWN: 2 });

// Detect whether instance is ran in browser or on node js
const ENV =
  typeof window === "object" && typeof window.document === "object"
    ? ENVIRONMENTS.BROWSER
    : typeof process === "object" && process.versions && process.versions.node
      ? ENVIRONMENTS.NODE
      : ENVIRONMENTS.UNKNOWN;

switch (ENV) {
  case ENVIRONMENTS.BROWSER:
    console.log = (old => (...params) => {
      old(...params);
      document.getElementById("output-log").innerHTML += `<code>${params
        .map(e => JSON.stringify(e))
        .join("<br>")}<br></code><hr>`;
    })(console.log);
    break;
  case ENVIRONMENTS.NODE:
    regrest = require("../regrest");
    break;
}

(async () => {
  try {
    await regrest
      .get("https://jsonplaceholder.typicode.com/posts/1")
      .then(response => console.log(JSON.parse(response)));

    await regrest
      .get("http://jsonplaceholder.typicode.com/comments", {
        params: { postId: 1 }
      })
      .then(response => console.log(JSON.parse(response)));

    await regrest
      .post(
        "https://jsonplaceholder.typicode.com/posts",
        JSON.stringify({
          title: "foo",
          body: "bar",
          userId: 1
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }
      )
      .then(response => console.log(JSON.parse(response)));

    await regrest
      .put(
        "https://jsonplaceholder.typicode.com/posts/1",
        JSON.stringify({
          id: 1,
          title: "foo",
          body: "bar",
          userId: 1
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }
      )
      .then(response => console.log(JSON.parse(response)));

    await regrest
      .patch(
        "https://jsonplaceholder.typicode.com/posts/1",
        JSON.stringify({
          title: "foo"
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }
      )
      .then(response => console.log(JSON.parse(response)));

    await regrest
      .delete("https://jsonplaceholder.typicode.com/posts/1")
      .then(response => console.log(JSON.parse(response)));

    console.log("PASSED ALL TESTS");
  } catch (error) {
    console.log(`FAILED WITH: ${error}`);
  }
})();
