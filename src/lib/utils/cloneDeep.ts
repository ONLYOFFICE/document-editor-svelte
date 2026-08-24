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
 * Deep clone of plain objects, arrays and dates. Anything else — functions in particular,
 * such as the event callbacks of the editor configuration — is copied by reference.
 *
 * `structuredClone` is not used here because it throws on functions.
 */
const cloneDeep = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(item => cloneDeep(item)) as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }

    if (isPlainObject(value)) {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            result[key] = cloneDeep(value[key]);
        }
        return result as T;
    }

    return value;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

export default cloneDeep;
