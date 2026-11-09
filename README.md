# Runtime Notes

A static, browser-first field guide to Python and Lua internals. The application is built with Next.js static export; there is no application server or code-execution API.

## Run locally

- Install Node.js 20 or newer.
- Run npm install.
- Run npm run dev and open the local URL printed by Next.js.
- Run npm run build to create the static site in out/.

The build pre-step copies Wasmoon and Pyodide runtime assets from the installed packages into public/. These files are generated and should not be committed. Runtime execution happens in disposable Web Workers. The UI can stop a run by terminating its worker; this keeps the page responsive but is not a strict memory quota or a security boundary.

## Runtime versions

- Lua 5.4: Wasmoon, the official Lua VM compiled to WebAssembly.
- Python: Pyodide, CPython compiled to WebAssembly.

The service worker caches the site and same-origin assets as they are requested. A first visit needs a network connection to download the runtimes; revisit after they finish loading for offline use.

## Current scope

This first slice includes three authored lessons per language, searchable lesson navigation, theme switching, local code execution, output/error display, and an offline cache. Instruction notes are educational summaries, not byte-for-byte disassembly for every interpreter build. Exact bytecode introspection and broader lesson coverage remain to be built.
