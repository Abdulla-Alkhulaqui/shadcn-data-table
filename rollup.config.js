import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import fs from "fs";
import path from "path";

import postcss from "rollup-plugin-postcss";

const packageJson = require("./package.json");

const srcAlias = {
  name: "src-alias",
  resolveId(source) {
    if (source.startsWith("@/")) {
      const target = path.resolve(__dirname, "src", source.slice(2));
      const candidates = [
        target,
        `${target}.ts`,
        `${target}.tsx`,
        `${target}.js`,
        `${target}.jsx`,
        path.join(target, "index.ts"),
        path.join(target, "index.tsx"),
      ];
      return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
    }
    return null;
  },
};

export default [
  {
    input: "src/index.ts",
    onwarn(warning, warn) {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
        return;
      }
      warn(warning);
    },
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      srcAlias,
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        compilerOptions: {
          composite: false,
          declaration: false,
          declarationMap: false,
          tsBuildInfoFile: ".tsbuildinfo",
        },
      }),
      terser(),
      postcss({
        extract: true,
        minimize: true,
        modules: false,
      }),
    ],
    external: ["react", "react-dom"],
  },
  {
    input: "src/index.ts",
    output: [{ file: packageJson.types }],
    plugins: [srcAlias, dts.default()],
    external: [/\.css$/],
  },
];
