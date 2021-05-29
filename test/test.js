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
    Object.entries({
      log: "white",
      info: "#00e676",
      warn: "#ffeb3b",
      error: "#f44336",
    }).forEach(
      ([method, color]) =>
        (console[method] = (
          (methodToExtend) =>
          (...params) => {
            methodToExtend(...params);
            document.getElementById(
              "output-log"
            ).innerHTML += `<code style="color: ${color}">${params
              .map((e) => JSON.stringify(e))
              .join("<br>")}<br></code><hr>`;
          }
        )(console[method]))
    );
    break;
  case ENVIRONMENTS.NODE:
    regrest = require("../lib/regrest");
    break;
}

(async () => {
  try {
    await regrest
      .get("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    await regrest
      .get("http://jsonplaceholder.typicode.com/comments", {
        params: { postId: 1 },
      })
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    await regrest
      .post(
        "https://jsonplaceholder.typicode.com/posts",
        JSON.stringify({
          title: "foo",
          body: "bar",
          userId: 1,
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    await regrest
      .put(
        "https://jsonplaceholder.typicode.com/posts/1",
        JSON.stringify({
          id: 1,
          title: "foo",
          body: "bar",
          userId: 1,
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          maxRedirects: 10,
        }
      )
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    await regrest
      .patch(
        "https://jsonplaceholder.typicode.com/posts/1",
        JSON.stringify({
          title: "foo",
        }),
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    await regrest
      .delete("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) =>
        console.log(`${response.status} ${response.statusText}`)
      );

    console.info("PASSED ALL TESTS");
  } catch (error) {
    console.error(`FAILED WITH: ${error}`);
  }
})();
