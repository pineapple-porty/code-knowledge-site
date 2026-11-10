import { loadPyodide } from "pyodide";
type RunMessage = { code: string };
self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const output: string[] = [];
  try {
    const pyodide = await loadPyodide({ indexURL: new URL("/pyodide/", self.location.origin).href });
    pyodide.setStdout({ batched: (text: string) => output.push(text) });
    pyodide.setStderr({ batched: (text: string) => output.push(text) });
    await pyodide.runPythonAsync(event.data.code);
    self.postMessage({ output: output.join("\n") || "(no output)" });
  } catch (error) { self.postMessage({ output: output.join("\n"), error: error instanceof Error ? error.message : String(error) }); }
};
