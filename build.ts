import { readFile, writeFile, readdir } from "fs/promises";
import { extname } from "path";
import { createHash } from "crypto";

import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { transform } from "@swc/core";

const extensions = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".cts", ".mts"];

/** @type import("rollup").InputPluginOption */
const plugins = [
    nodeResolve(),
    commonjs(),
    {
        name: "swc",
        async transform(code, id) {
            const ext = extname(id);
            if (!extensions.includes(ext)) return null;

            const ts = ext.includes("ts");
            const tsx = ts ? ext.endsWith("x") : undefined;
            const jsx = !ts ? ext.endsWith("x") : undefined;

            const result = await transform(code, {
                filename: id,
                jsc: {
                    externalHelpers: false,
                    parser: {
                        syntax: ts ? "typescript" : "ecmascript",
                        tsx,
                        jsx,
                    },
                },
                env: {
                    targets: "defaults",
                    include: [
                        "transform-classes",
                        "transform-arrow-functions",
                    ],
                },
            });
            return result.code;
        },
    },
    esbuild({ minify: true }),
];

export default async function build(path: string) {
    const bundle = await rollup({
        input: path,
        onwarn: () => {},
        plugins,
    });

    let { output } = await bundle.generate({
        globals(id) {
            if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
            const map = {
                react: "window.React",
            };

            return map[id] || null;
        },
        format: "iife",
        compact: true,
        exports: "named",
    });

    await bundle.close();
    return output[0].code;
}
