"use client";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/data/lessons";

type Props = { language: Language; initialCode: string };
export default function CodePlayground({ language, initialCode }: Props) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setCode(initialCode); setOutput(""); setState("idle"); }, [initialCode, language]);
  useEffect(() => () => { workerRef.current?.terminate(); if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function stop() {
    workerRef.current?.terminate(); workerRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null; setState("idle");
  }
  function run() {
    stop(); setOutput(""); setState("running");
    try {
      const worker = language === "lua"
        ? new Worker(new URL("../workers/lua.worker.ts", import.meta.url), { type: "module" })
        : new Worker(new URL("../workers/python.worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<{ output?: string; error?: string }>) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        worker.terminate(); workerRef.current = null;
        setOutput(event.data.output || event.data.error || "Finished with no output.");
        setState(event.data.error ? "error" : "done");
      };
      worker.onerror = (event) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        worker.terminate(); workerRef.current = null;
        setOutput(event.message || "The runtime could not start. Try again after the page finishes loading.");
        setState("error");
      };
      worker.postMessage({ code });
      timerRef.current = setTimeout(() => {
        worker.terminate(); workerRef.current = null;
        setOutput("Stopped after 12 seconds. The worker was terminated; your page is still responsive.");
        setState("error");
      }, 12_000);
    } catch (error) { setOutput(error instanceof Error ? error.message : "Could not start the runtime."); setState("error"); }
  }

  return (
    <section className="playground" aria-label={language === "lua" ? "Lua 5.4 code playground" : "Python code playground"}>
      <div className="playground-topline">
        <div className="file-tab"><span className={"language-dot " + language} />{language === "lua" ? "main.lua" : "main.py"}<span className="file-dirty">●</span></div>
        <div className="editor-tools"><span className="editor-version">{language === "lua" ? "Lua 5.4 · Wasmoon / WebAssembly" : "Python · Pyodide / WebAssembly"}</span></div>
      </div>
      <div className="editor-body"><div className="line-numbers" aria-hidden="true">{code.split("\n").map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}</div><textarea aria-label="Editable code sample" spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); run(); } }} /></div>
      <div className="runbar"><button className="run-button" onClick={run} disabled={state === "running"}><span aria-hidden="true">{state === "running" ? "◌" : "▶"}</span>{state === "running" ? "Running" : "Run example"}<kbd>⌘ ↵</kbd></button>{state === "running" && <button className="stop-button" onClick={stop}>Stop</button>}<span className="run-status">{state === "running" ? "Executing locally in your browser…" : "No code leaves your device"}</span></div>
      <div className="terminal"><div className="terminal-heading"><span><i className={state === "error" ? "status-light error" : "status-light"} />{state === "error" ? "Execution stopped" : "Output"}</span><span className="terminal-path">local / sandbox</span></div><pre aria-live="polite">{output || (state === "running" ? "Starting the runtime…" : "Run the example to see its output.")}</pre></div>
    </section>
  );
}
