import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * Read by `svelte-package`: the TypeScript in the components is preprocessed away,
 * so the published files are plain Svelte that any Svelte 4 or 5 setup can compile.
 */
export default {
    // `script: true` is required here: by default vitePreprocess only handles <style>,
    // because in an app Vite transpiles the TypeScript itself. When packaging there is no Vite.
    preprocess: vitePreprocess({ script: true })
};
