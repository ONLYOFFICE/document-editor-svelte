import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [svelte()],
    build: {
        rollupOptions: {
            // The editor and the preload component are exercised on separate pages.
            input: {
                main: "index.html",
                preload: "preload.html"
            }
        }
    }
});
