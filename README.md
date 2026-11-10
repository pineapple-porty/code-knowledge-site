# Runtime Notes

A personal hobby wiki for Python and Lua internals: language details, compiler quirks, and runtime behavior worth collecting. It is not a course and has no lesson progression or learning goals.

## Local development

Use Node.js 20.9 or newer. Install dependencies with npm install, then run npm run dev. The predev script copies the local Wasmoon and Pyodide distributions into public/.

Run npm run typecheck for the TypeScript check. Run npm run build for the static export in out/. Host out/ with a static web server; next start is not used for exported sites.

## Browser runtimes

Lua 5.4 uses Wasmoon: official Lua compiled to WebAssembly. Python uses Pyodide: CPython compiled to WebAssembly. Both optional demos execute in disposable browser workers. The parent page terminates a run after its timeout; this is not a strict memory quota or a security guarantee.

Runtime assets are staged from npm packages and ignored by Git. There is no execution backend or runtime AI API. The initial visit requires a connection, and the service worker caches requested same-origin resources. Offline behavior has not yet been verified.

## Draft status

This first draft contains six topic entries, topic search, dark/light themes, optional editable demos, implementation notes, and a static-export configuration. Exact instruction listings are illustrative, not live disassemblies.

Production build and browser verification are pending: the verification sandbox killed dependency installs and subsequently timed out even when starting node --version. No deployment has been made.
