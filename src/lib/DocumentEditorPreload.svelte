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
    import type { DocumentEditorPreloadProps } from "./types.js";

    export let documentServerUrl: DocumentEditorPreloadProps["documentServerUrl"];

    /**
     * The component shares nothing with DocumentEditor: it neither loads api.js nor touches
     * the DocsAPI globals. All it does is let the browser cache the editor assets, which are
     * requested by the preload page inside its own iframe context.
     */
    $: url = documentServerUrl.endsWith("/") ? documentServerUrl : `${documentServerUrl}/`;
    $: src = `${url}web-apps/apps/api/documents/preload.html`;
</script>

<iframe
    {src}
    title="onlyoffice-preload"
    tabindex="-1"
    aria-hidden="true"
    style="display: none;"
></iframe>
