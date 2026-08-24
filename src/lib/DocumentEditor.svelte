<!--
 (c) Copyright Ascensio System SIA 2026

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { DocumentEditorProps } from "./types.js";
    import cloneDeep from "./utils/cloneDeep.js";
    import loadScript from "./utils/loadScript.js";

    export let id: DocumentEditorProps["id"];

    export let documentServerUrl: DocumentEditorProps["documentServerUrl"];
    export let shardkey: DocumentEditorProps["shardkey"] = true;

    export let config: DocumentEditorProps["config"];

    export let onLoadComponentError: DocumentEditorProps["onLoadComponentError"] = undefined;

    const SCRIPT_ID = "onlyoffice-api-script";

    /**
     * Serialized snapshot of the props that require a full editor reload when changed.
     * The `events` callbacks of the configuration are dropped by JSON.stringify, so replacing
     * a handler alone does not reload the editor.
     */
    let previousImportantProps: string | undefined = undefined;

    /**
     * Loading api.js is asynchronous and cannot be cancelled, so the component may already be
     * gone by the time it settles. Nothing must be created or reported after that point.
     */
    let destroyed = false;

    $: importantProps = JSON.stringify([documentServerUrl, config]);

    $: onImportantPropsChange(importantProps);

    function onImportantPropsChange(snapshot: string) {
        // The very first run only records the snapshot: the editor is created in onMount.
        if (previousImportantProps === undefined) {
            previousImportantProps = snapshot;
            return;
        }

        if (previousImportantProps === snapshot) return;
        previousImportantProps = snapshot;

        if (!destroyEditor()) return;

        console.log("Important props have been changed. Load new Editor.");
        onLoad();
    }

    onMount(() => {
        let url = documentServerUrl;
        if (!url.endsWith("/")) url += "/";

        let docsApiUrl = `${url}web-apps/apps/api/documents/api.js`;
        if (shardkey) {
            if (typeof shardkey === "boolean") {
                docsApiUrl += `?shardkey=${config.document?.key}`;
            } else {
                docsApiUrl += `?shardkey=${shardkey}`;
            }
        }

        loadScript(docsApiUrl, SCRIPT_ID)
            .then(() => onLoad())
            .catch(() => onError(-2));
    });

    onDestroy(() => {
        destroyed = true;
        destroyEditor();
    });

    /** Destroys the editor instance registered under `id`. Returns whether there was one. */
    function destroyEditor(): boolean {
        if (typeof window === "undefined") return false;

        const instance = window.DocEditor?.instances[id];
        if (!instance) return false;

        instance.destroyEditor();
        window.DocEditor!.instances[id] = undefined;
        return true;
    }

    function onLoad() {
        if (destroyed) return;

        try {
            if (!window.DocsAPI) {
                onError(-3);
                return;
            }

            if (window.DocEditor?.instances[id]) {
                console.log("Skip loading. Instance already exists", id);
                return;
            }

            if (!window.DocEditor?.instances) {
                window.DocEditor = { instances: {} };
            }

            // Cloned so that the editor cannot mutate the object owned by the consumer.
            const initConfig = cloneDeep(config);

            window.DocEditor!.instances[id] = new window.DocsAPI.DocEditor(id, initConfig);
        } catch (error) {
            console.error(error);
            onError(-1);
        }
    }

    function onError(errorCode: number) {
        if (destroyed) return;

        let message: string;

        switch (errorCode) {
            case -2:
                message = "Error load DocsAPI from " + documentServerUrl;
                break;
            case -3:
                message = "DocsAPI is not defined";
                break;
            default:
                message = "Unknown error loading component";
                errorCode = -1;
        }

        if (typeof onLoadComponentError === "undefined") {
            console.error(message);
        } else {
            onLoadComponentError(errorCode, message);
        }
    }
</script>

<div {id}></div>
