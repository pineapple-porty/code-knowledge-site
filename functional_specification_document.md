# SYSTEM PROMPT & SPECIFICATION DOCUMENT
## Project: Python & Lua Compiler & Language Exploration Platform

---

## 1. Project Overview & System Context

### 1.1 Purpose
This document serves as the master specification and prompt reference for building a lightweight, ultra-performant, developer-focused educational platform dedicated to **Python** and **Lua**. The platform focuses on low-level language concepts, including compiler mechanics, virtual machine runtimes (CPython VM and Lua VM), bytecode instruction sets, memory management models, execution paradigms, and standard library architectures.

### 1.2 Core Pillars
1. **Minimalist Aesthetic:** High readability, plain CSS styling, zero visual bloat, dark/light theme options, and optimized typographic hierarchy for reading code and technical documentation.
2. **100% Offline Client-Side Execution:** Code snippets execute locally inside the browser using WebAssembly (WASM) runtimes isolated in Web Workers—eliminating server-side hosting costs, runtime latency, and execution security risks.
3. **Pre-Generated Build-Time Insights:** Technical breakdowns of bytecode, language syntax rules, and internal compiler decisions are pre-generated via Google AI Studio during the content authoring phase and served as static JSON files.

---

## 2. Technical Stack Architecture

| Layer | Selected Technology | Technical Rationale & Role |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Configured for pure Static Site Generation (`output: 'export'`). Generates zero-backend HTML/CSS/JS bundles. |
| **Styling** | Plain CSS (`globals.css`) | Custom CSS variables for theme switching, zero framework overhead, fast rendering, strict typography grids. |
| **Python Runtime** | Pyodide (WASM) | CPython 3.12+ compiled to WebAssembly. Runs offline in dedicated browser Web Workers. |
| **Lua Runtime** | Fengari (WASM/JS) | Lua 5.3+ virtual machine compiled to JS/WASM. Runs offline in dedicated browser Web Workers. |
| **Content Authoring** | Raw HTML & Modular Components | Simple, direct page construction without complex dynamic CMS overhead or database bloat. |
| **AI Content Pipeline** | Google AI Studio (Gemini 1.5 Pro) | Used offline during authoring to pre-compute JSON datasets detailing bytecode, syntax tooltips, and compiler notes. |
| **Deployment / CDN** | Vercel / Cloudflare Pages / GitHub Pages | Static edge hosting with automatic continuous integration deployments triggered via Git commits. |

---

## 3. WebAssembly Execution Engine & Worker Model

### 3.1 Web Worker Architecture
To ensure infinite loops or memory-intensive execution in user scripts never freeze the main browser thread or UI controls, all client-side code execution is isolated within dedicated Web Workers located at `/public/wasm/workers/`.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Client Browser Main Thread                                             │
│                                                                        │
│  ├── User clicks "Run Snippet"                                         │
│  ├── UI posts message to Web Worker: { language, code }                │
│  └── Listens for async execution events: { stdout, stderr, executionTime }
└──────────────────┬──────────────────────────────────▲──────────────────┘
                   │ postMessage                      │ postMessage
                   ▼                                  │
┌─────────────────────────────────────────────────────┴──────────────────┐
│ Web Worker Thread (/public/wasm/workers/)                              │
│                                                                        │
│  ├── Pyodide Worker (Python 3.12+ WASM Runtime)                        │
│  └── Fengari Worker (Lua 5.3+ VM Runtime)                              │
│  └── Enforces step count / memory ceilings to safely terminate loops   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Pre-Generated AI Explanations Workflow

### 4.1 Authoring & Deployment Flow
Rather than requesting explanations via dynamic API calls at runtime (which causes latency, billing costs, and rate limits), explanations are generated during content creation using Google AI Studio and baked into static site assets.

```
[Content Authoring Phase: Google AI Studio / Gemini 1.5 Pro]
               │
               ▼
[Pass code snippets & CPython/Lua reference manuals into system prompts]
               │
               ▼
[Generate line-by-line Bytecode & Syntax explanation JSON files]
               │
               ▼
[Save JSON datasets in `/src/data/explanations/` repository directory]
               │
               ▼
[Production Build: Next.js Static Export (`npm run build`)]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ Static Production Bundle (Zero Runtime API Cost)        │
│                                                        │
│  ├── Static HTML/CSS Lesson Pages                      │
│  ├── Instant Local Bytecode Tooltips & Sidebars        │
│  └── Isolated Offline WASM Execution                   │
└────────────────────────────────────────────────────────┘
```

### 4.2 Standard Explanation JSON Schema
```json
{
  "lesson_id": "lua-table-mechanics",
  "language": "lua",
  "topic": "Array vs Hash Partitions",
  "opcodes": {
    "NEWTABLE": "Allocates array and hash space. Parameters determine initial size hints.",
    "SETTABLE": "Assigns key-value pair to table structure using computed hash index or array offset."
  },
  "runtime_notes": "Lua tables dynamically rehash and double capacity when boundary constraints are exceeded."
}
```

---

## 5. Development Roadmap & Execution Phases

### Phase 1: Infrastructure Setup
* Initialize Next.js project with static export configuration (`output: 'export'`).
* Create `/src/app/globals.css` with CSS variables for dark/light themes and monospace font scales.
* Download and place Pyodide and Fengari browser dependencies into `/public/wasm/`.

### Phase 2: Static Templates & Design System
* Build baseline navigation header, footer, and responsive content drawers.
* Create standardized HTML/CSS lesson containers for Python and Lua content.
* Build code snippet UI components with line numbers, copy actions, and execution buttons.

### Phase 3: WebAssembly Integration & Explanation Panels
* Implement Web Workers for background Python and Lua script execution.
* Integrate terminal output drawers to stream WASM stdout/stderr.
* Wire up pre-generated JSON datasets to interactive line tooltips and side-over panels.

### Phase 4: Production Build & Continuous Deployment
* Verify build integrity via `npm run build` to ensure pure static export compliance.
* Link GitHub repository to edge hosting (Vercel or Cloudflare Pages) for automated build triggers.

---

## 6. Git Setup Commands

```bash
# 1. Create static Next.js boilerplate
npx create-next-app@latest python-lua-docs --typescript --no-tailwind --app --src-dir

# 2. Enter project directory
cd python-lua-docs

# 3. Initialize Git repository baseline
git checkout -b main
git add .
git commit -m "feat: initialize static Next.js documentation platform"

# 4. Connect remote repository and push initial commit
git remote add origin https://github.com/your-username/python-lua-docs.git
git branch -M main
git push -u origin main
```