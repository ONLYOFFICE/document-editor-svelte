<script lang="ts">
    import type { Config } from "@onlyoffice/doceditor-types";
    import { DocumentEditor } from "@onlyoffice/document-editor-svelte";

    const config: Config = {
        document: {
            fileType: "docx",
            key: "e2e-test-key",
            title: "e2e-test-document.docx",
            url: "http://e2e-document-server.test/e2e-test-document.docx"
        },
        documentType: "word",
        editorConfig: {
            callbackUrl: "http://e2e-document-server.test/callback"
        },
        events: {
            onAppReady: () => {
                (window.__e2eEvents__ ??= []).push("appReady");
            }
        }
    };

    const onLoadComponentError = (errorCode: number, errorDescription: string) => {
        (window.__e2eErrors__ ??= []).push({ errorCode, errorDescription });
    };

    let mounted = $state(true);
    let documentKey = $state(config.document!.key!);

    const editorConfig = $derived<Config>({
        ...config,
        document: { ...config.document!, key: documentKey }
    });
</script>

<button data-testid="toggle-editor" onclick={() => (mounted = !mounted)}>
    {mounted ? "unmount" : "mount"}
</button>
<button data-testid="change-key" onclick={() => (documentKey = "e2e-changed-key")}>
    change key
</button>

{#if mounted}
    <DocumentEditor
        id="e2e-editor"
        documentServerUrl="http://e2e-document-server.test/"
        config={editorConfig}
        {onLoadComponentError}
    />
{/if}
