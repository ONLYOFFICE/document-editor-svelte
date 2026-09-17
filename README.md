# @onlyoffice/document-editor-svelte

This repo contains the ONLYOFFICE Docs Svelte component which integrates [ONLYOFFICE Document Server](https://github.com/ONLYOFFICE/DocumentServer) into [Svelte](https://svelte.dev/) projects.

**Please note**: Before working with this component, you need to install ONLYOFFICE Docs. To do so, you can use [Docker](https://github.com/onlyoffice/Docker-DocumentServer) (recommended).

## Prerequisites

This procedure requires [Node.js (and npm)](https://nodejs.org/en).

The component supports Svelte 4 and Svelte 5.

## Creating the demo Svelte application with ONLYOFFICE Docs editor

This procedure creates a basic Svelte application and installs an ONLYOFFICE Docs editor in it.

1. Create a new Svelte project named *onlyoffice-svelte-demo* using the *Vite* package:
```
npm create vite@latest onlyoffice-svelte-demo -- --template svelte
```

2. Go to the newly created directory and install its dependencies:
```
cd onlyoffice-svelte-demo
npm install
```

3. Install ONLYOFFICE Docs Svelte component from **npm** and save it to the *package.json* file with *--save*:
```
npm install --save @onlyoffice/document-editor-svelte
```

4. Open the *./src/App.svelte* file in the *onlyoffice-svelte-demo* project and replace its contents with the following code:

```
<script>
    import { DocumentEditor } from "@onlyoffice/document-editor-svelte";

    var onDocumentReady = function () {
        console.log("Document is loaded");
    };

    var onLoadComponentError = function (errorCode, errorDescription) {
        switch (errorCode) {
            case -1: // Unknown error loading component
                console.log(errorDescription);
                break;

            case -2: // Error load DocsAPI from http://documentserver/
                console.log(errorDescription);
                break;

            case -3: // DocsAPI is not defined
                console.log(errorDescription);
                break;
        }
    };
</script>

<DocumentEditor
    id="docxEditor"
    documentServerUrl="http://documentserver/"
    config={{
        "document": {
            "fileType": "docx",
            "key": "Khirz6zTPdfd7",
            "title": "Example Document Title.docx",
            "url": "https://example.com/url-to-example-document.docx"
        },
        "documentType": "word",
        "editorConfig": {
            "callbackUrl": "https://example.com/url-to-callback.ashx"
        },
        "events": {
            "onDocumentReady": onDocumentReady
        },
        "height": "100%",
        "width": "100%"
    }}
    onLoadComponentError={onLoadComponentError}
/>
```
Replace the following lines with your own data:
* **"http://documentserver/"** - replace with the URL of your server;
* **"https://example.com/url-to-example-document.docx"** - replace with the URL to your file;
* **"https://example.com/url-to-callback.ashx"** - replace with your callback URL (this is required for the saving functionality to work).

This file will create the *App* component containing the ONLYOFFICE Docs editor configured with basic features.

5. Test the application using the Node.js development server:
* To start the development server, navigate to the *onlyoffice-svelte-demo* directory and run:
```
npm run dev
```
* To stop the development server, select on the command line or command prompt and press *Ctrl+C*.

## Deploying the demo Svelte application

The easiest way to deploy the application to a production environment is to install [serve](https://github.com/vercel/serve) and create a static server:
1. Install the *serve* package globally:
```
npm install -g serve
```

2. Serve your static site on the 3000 port:
```
serve -s dist
```
Another port can be adjusted using the *-l* or *--listen* flags:
```
serve -s dist -l 4000
```

3. To serve the project folder, go to it and run the *serve* command:
```
cd onlyoffice-svelte-demo
serve
```

Now you can deploy the application to the created server:
1. Navigate to the *onlyoffice-svelte-demo* directory and run:
```
npm run build
```
The *dist* directory will be created with a production build of your app.

2. Copy the contents of the *onlyoffice-svelte-demo/dist* directory to the root directory of the web server (to the *onlyoffice-svelte-demo* folder).

The application will be deployed on the web server (*http://localhost:3000* by default).

## API
### Props
| Name | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| `id` | string | null | yes | Component unique identifier. It is also the id of the placeholder element the editor is rendered into. |
| `documentServerUrl` | string | null | yes | Address of ONLYOFFICE Document Server. |
| `shardkey` | string \| boolean | true | no | The string or boolean parameter required to request load balancing during collaborative editing: all users editing the same document are served by the same server. [Shard key](https://api.onlyoffice.com/docs/docs-api/get-started/how-it-works/#shard-key)|
| `config` | object | null | yes | Generic configuration object for opening a file with token, including the `events` section with the editor callbacks. [Config API](https://api.onlyoffice.com/docs/docs-api/usage-api/config/) |
| `onLoadComponentError` | (errorCode: number, errorDescription: string) => void | null | no | The function called when an error occurs while loading a component |

The editor callbacks (`onDocumentReady`, `onError`, `onRequestSaveAs` and the rest) are passed inside `config.events`, exactly as described in the [Config API](https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/).

The component renders a single `<div id={id}>` placeholder that Document Server fills with its iframe, so give that element a size — either through `config.height` and `config.width` or with your own CSS.

Changing `documentServerUrl` or `config` destroys the current editor and creates a new one.

### TypeScript

Type definitions for the editor configuration come from [@onlyoffice/doceditor-types](https://github.com/ONLYOFFICE/doceditor-types), which is a peer dependency of this package:
```
npm install --save @onlyoffice/doceditor-types
```

## Preloading the editor

Starting from ONLYOFFICE Docs 9.0, the editor static assets (HTML, CSS, JS, fonts) can be cached before a document is opened, which makes the first opening faster. [Preload](https://api.onlyoffice.com/docs/docs-api/get-started/configuration/preload/)

Place the `DocumentEditorPreload` component on a page where the editor itself is not shown yet: a file list, a login screen, an application layout.

```
<script>
    import { DocumentEditorPreload } from "@onlyoffice/document-editor-svelte";
</script>

<DocumentEditorPreload documentServerUrl="http://documentserver/" />
```

The component renders a hidden iframe with the preload page of ONLYOFFICE Docs and does nothing else. Rendering it next to `DocumentEditor` brings no benefit, because `DocumentEditor` requests the same assets as soon as it is mounted.

### Props
| Name | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| `documentServerUrl` | string | null | yes | Address of ONLYOFFICE Document Server. |

**Please note**:
* the preload page appeared in ONLYOFFICE Docs 9.0, earlier versions answer the request for it with the 404 error: it breaks nothing, but is visible in the browser network log;
* one component per application is enough;
* do not replace it with `<link rel="prefetch">`: the editor assets are loaded within the iframe context, so prefetch will not cache them.

## Development

### Clone project from the GitHub repository:
```
git clone https://github.com/ONLYOFFICE/document-editor-svelte
```
### Install the project dependencies:
```
npm install
```
### Check the types of the component:
```
npm run check
```
### Lint the project:
```
npm run lint
```
### Build the project:
```
npm run build
```
### Create the package:
```
npm pack
```
### Run the end-to-end tests:
The `e2e` directory is a separate Svelte application that installs the packed component and drives
it with [Playwright](https://playwright.dev/). Browsers have to be installed once:
```
npm --prefix e2e exec playwright install chromium
```
```
npm run test:e2e
```
To test a version published on npm instead of the local sources, set `E2E_LIB_VERSION`:
```
E2E_LIB_VERSION=0.1.0 npm run test:e2e
```

## Feedback and support

In case you have any issues, questions, or suggestions for the ONLYOFFICE Document Server Svelte component, please refer to the [Issues](https://github.com/ONLYOFFICE/document-editor-svelte/issues) section.

Official project website: [www.onlyoffice.com](https://www.onlyoffice.com/).

Support forum: [forum.onlyoffice.com](https://forum.onlyoffice.com/).
