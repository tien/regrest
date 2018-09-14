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
      error: "#f44336"
    }).forEach(
      ([method, color]) =>
        (console[method] = (methodToExtend => (...params) => {
          methodToExtend(...params);
          document.getElementById(
            "output-log"
          ).innerHTML += `<code style="color: ${color}">${params
            .map(e => JSON.stringify(e))
            .join("<br>")}<br></code><hr>`;
        })(console[method]))
    );
    break;
  case ENVIRONMENTS.NODE:
    regrest = require("../build/regrest");
    break;
}

(async () => {
  try {
    await regrest
      .get("https://jsonplaceholder.typicode.com/posts/1")
      .then(response => {
        console.log(
          response.arrayBuffer,
          response.text,
          response.json
        );
      });

    console.info("PASSED ALL TESTS");
  } catch (error) {
    console.error(`FAILED WITH: ${error}`);
  }
})();
