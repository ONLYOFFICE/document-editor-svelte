import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** The e2e app is written in TypeScript, so the components need the preprocessor. */
export default {
    preprocess: vitePreprocess()
};
