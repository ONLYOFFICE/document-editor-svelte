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

import type { Config, DocEditor } from "@onlyoffice/doceditor-types";

declare global {
    interface Window {
        DocsAPI?: {
            DocEditor: new (id: string, config: Config) => DocEditor;
        };
        DocEditor?: {
            instances: Record<string, DocEditor | undefined>;
        };
    }
}

/** Called when the component itself (not the document) fails to load. */
export type LoadComponentErrorHandler = (errorCode: number, errorDescription: string) => void;

export type DocumentEditorProps = {
    /** Component unique identifier. Also used as the id of the placeholder element. */
    id: string;

    /** Address of ONLYOFFICE Document Server, for example `https://documentserver/`. */
    documentServerUrl: string;

    /**
     * Load balancing parameter that routes users editing the same document to the same server.
     * `true` (default) uses `config.document.key`, a string sets the value explicitly,
     * `false` disables the parameter.
     */
    shardkey?: string | boolean;

    /**
     * Generic configuration object for opening a file, including the `events` section
     * with the editor callbacks.
     */
    config: Config;

    /**
     * Called when the component fails to load the editor.
     *
     * - `-1` — unknown error loading component
     * - `-2` — error load DocsAPI from `documentServerUrl`
     * - `-3` — DocsAPI is not defined
     */
    onLoadComponentError?: LoadComponentErrorHandler;
};

export type DocumentEditorPreloadProps = {
    /** Address of ONLYOFFICE Document Server, for example `https://documentserver/`. */
    documentServerUrl: string;
};
