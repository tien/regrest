import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/index.js",
    external: [/@babel\/runtime/],
    output: [
      {
        dir: "lib",
        format: "cjs",
        exports: "default",
      },
      {
        file: "lib/index.mjs",
        format: "es",
      },
    ],
    plugins: [babel({ babelHelpers: "runtime" })],
  },
  {
    input: "src/index.js",
    output: {
      file: "lib/index.umd.min.js",
      format: "umd",
      name: "regrest",
      sourcemap: true,
      compact: true,
      plugins: [terser()],
    },
    plugins: [
      babel({
        presets: ["@babel/preset-env"],
        babelHelpers: "bundled",
        babelrc: false,
      }),
    ],
  },
];
