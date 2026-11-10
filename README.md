# Runtime Notes

A personal hobby wiki for Python, Lua, Bash, and Ruby internals: language details, compiler quirks, and runtime behavior worth collecting. It is not a course and has no lesson progression or learning goals.

## Local development

Use Node.js 20.9 or newer. Install dependencies with npm install, then run npm run dev. The development and build scripts stage the local Wasmoon, Pyodide, and Ruby WebAssembly runtimes into public/.

Run npm run typecheck for the TypeScript check. Run npm run build for the static export in out/. Host out/ with a static web server; next start is not used for exported sites.

## Browser runtimes

Lua 5.4 uses Wasmoon, and Python uses Pyodide; both run in disposable browser workers. Ruby 3.4 uses ruby.wasm and also runs in a disposable worker. Bash examples are static reference snippets and are not executed in the browser. Worker timeouts limit run duration but are not a strict memory quota or a security guarantee.

Runtime assets are staged from npm packages and ignored by Git. There is no execution backend or runtime AI API. The initial visit requires a connection, and the service worker caches requested same-origin resources. Offline behavior has not yet been verified.

## Draft status

The wiki contains twelve topic entries, compiler diagrams, sourced summaries, topic search, dark/light themes, and local examples for the supported browser runtimes. Exact instruction listings are illustrative, not live disassemblies.

The site is configured for static export to out/. No deployment has been made.
