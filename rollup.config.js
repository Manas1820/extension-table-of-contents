// rollup.config.js

const autoExternal = require("rollup-plugin-auto-external");
const sourcemaps = require("rollup-plugin-sourcemaps");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel");
const typescript = require("rollup-plugin-typescript2");

const external = [
  "@tiptap/core",
  "@tiptap/pm/state",
  "@tiptap/pm/model",
  "@tiptap/pm/view",
];

const config = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/index.js",
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
  external,
  plugins: [
    autoExternal({ packagePath: "./package.json" }),
    sourcemaps(),
    babel(),
    commonjs(),
    typescript(),
  ],
};

module.exports = config;
