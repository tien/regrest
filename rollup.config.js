import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const extensions = [".ts"];

export default [
  {
    input: "src/index.ts",
    external: [/@babel\/runtime/],
    output: [
      {
        dir: "lib",
        format: "cjs",
        exports: "named",
      },
      {
        file: "lib/index.mjs",
        format: "es",
      },
    ],
    plugins: [
      resolve({ extensions }),
      babel({
        babelHelpers: "runtime",
        extensions,
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "lib/index.umd.min.js",
      format: "umd",
      name: "regrest",
      sourcemap: true,
      compact: true,
      exports: "named",
      plugins: [terser()],
    },
    plugins: [
      resolve({ extensions }),
      babel({
        presets: ["@babel/preset-env", "@babel/preset-typescript"],
        babelHelpers: "bundled",
        babelrc: false,
        extensions,
      }),
    ],
  },
];
