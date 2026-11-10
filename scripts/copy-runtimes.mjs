import { cp, copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const wasmSource = join(root, "node_modules/wasmoon/dist/glue.wasm");
const wasmTargetDir = join(root, "public/wasm");
const pyodideSource = join(root, "node_modules/pyodide");
const pyodideTarget = join(root, "public/pyodide");

await mkdir(wasmTargetDir, { recursive: true });
await copyFile(wasmSource, join(wasmTargetDir, "glue.wasm"));
await mkdir(pyodideTarget, { recursive: true });
for (const file of await readdir(pyodideSource)) {
  await cp(join(pyodideSource, file), join(pyodideTarget, file), { recursive: true });
}
console.log("Staged local Wasmoon and Pyodide browser runtimes.");
