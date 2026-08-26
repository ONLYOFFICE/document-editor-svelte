import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const e2eRoot = join(__dirname, "..");
const repoRoot = join(e2eRoot, "..");
const tmpDir = join(e2eRoot, ".tmp");
const libVersion = process.env.E2E_LIB_VERSION?.trim();

function run(cmd, args, cwd) {
    const commandLine = [cmd, ...args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))].join(" ");
    console.log(`> (${cwd}) ${commandLine}`);
    // `--prefix` from the caller (`npm --prefix e2e run test`) leaks through npm_config_prefix
    // and would send the nested npm commands to the wrong directory.
    const env = { ...process.env };
    delete env.npm_config_prefix;
    execSync(commandLine, { cwd, env, stdio: "inherit" });
}

if (libVersion) {
    console.log(`== Installing @onlyoffice/document-editor-svelte@${libVersion} from npm ==`);
    run("npm", ["install", `@onlyoffice/document-editor-svelte@${libVersion}`, "--no-save"], e2eRoot);
} else {
    console.log("== Building @onlyoffice/document-editor-svelte ==");
    run("npm", ["run", "build"], repoRoot);

    rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir, { recursive: true });

    // `npm pack` runs the `prepack` script of the library, which rebuilds it with
    // `svelte-package` and validates the published files with `publint`.
    console.log("== Packing library ==");
    run("npm", ["pack", "--pack-destination", tmpDir], repoRoot);

    const tarball = readdirSync(tmpDir).find((file) => file.endsWith(".tgz"));
    if (!tarball) {
        throw new Error(`No .tgz produced in ${tmpDir}`);
    }
    const tarballPath = join(tmpDir, tarball);

    console.log(`== Installing ${tarball} into e2e/node_modules ==`);
    run("npm", ["install", tarballPath, "--no-save"], e2eRoot);
}

console.log("== Done ==");
