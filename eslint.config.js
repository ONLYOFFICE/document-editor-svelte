import path from "node:path";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
    includeIgnoreFile(gitignorePath),
    // The e2e app is a separate nested npm project with its own toolchain.
    { ignores: ["e2e/**"] },
    js.configs.recommended,
    ts.configs.recommended,
    svelte.configs.recommended,
    // Formatting is enforced by ESLint itself: 4 spaces, double quotes.
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        jsx: false,
        braceStyle: "1tbs",
        commaDangle: "never"
    }),
    {
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            // typescript-eslint strongly recommends not using no-undef on TypeScript projects.
            // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/
            "no-undef": "off",
            "@stylistic/max-len": ["error", { code: 100, ignoreUrls: true, ignoreComments: false }]
        }
    },
    {
        files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: [".svelte"],
                parser: ts.parser
            }
        },
        rules: {
            // The generic indent rule cannot handle Svelte markup — the plugin's own rule can.
            "@stylistic/indent": "off",
            "svelte/indent": ["error", { indent: 4 }],
            "svelte/html-quotes": ["error", { prefer: "double" }]
        }
    }
);
