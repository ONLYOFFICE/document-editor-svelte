/*
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Load the Document Server api.js script once, no matter how many editors are mounted.
 *
 * Resolves as soon as `window.DocsAPI` is available, rejects when the script fails to load.
 */
const loadScript = (url: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // If DocsAPI is defined return resolve.
        if (window.DocsAPI) return resolve();

        const existedScript = document.getElementById(id);

        if (existedScript) {
            // If the script element is found, wait for it to load.
            const intervalHandler = setInterval(() => {
                // If the download is not completed, continue to wait.
                if (existedScript.hasAttribute("loading")) return;

                // If the download is completed, stop the wait.
                clearInterval(intervalHandler);

                // If DocsAPI is defined, after loading return resolve.
                if (window.DocsAPI) return resolve();

                // If DocsAPI is not defined, delete the existing script and create a new one.
                const script = createScriptTag(id, url, resolve, reject);
                existedScript.remove();
                document.body.appendChild(script);
            }, 500);
        } else {
            // If the script element is not found, create it.
            const script = createScriptTag(id, url, resolve, reject);
            document.body.appendChild(script);
        }
    });
};

const createScriptTag = (
    id: string,
    url: string,
    resolve: () => void,
    reject: (reason?: unknown) => void
): HTMLScriptElement => {
    const script = document.createElement("script");

    script.id = id;
    script.type = "text/javascript";
    script.src = url;
    script.async = true;

    script.onload = () => {
        // Remove attribute loading after loading is complete.
        script.removeAttribute("loading");
        resolve();
    };
    script.onerror = (error) => {
        // Remove attribute loading after loading is complete.
        script.removeAttribute("loading");
        reject(error);
    };

    script.setAttribute("loading", "");

    return script;
};

export default loadScript;
