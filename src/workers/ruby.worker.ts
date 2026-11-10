import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";

type RunMessage = { code: string };

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const output: string[] = [];
  const errors: string[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;

  try {
    console.log = (...values: unknown[]) => output.push(values.map(String).join(" "));
    console.warn = (...values: unknown[]) => errors.push(values.map(String).join(" "));

    const wasmUrl = new URL("/ruby/ruby+stdlib.wasm", self.location.origin);
    const response = await fetch(wasmUrl);
    if (!response.ok) throw new Error(`Could not load the Ruby runtime (${response.status}).`);

    const module = await WebAssembly.compileStreaming(response);
    const { vm } = await DefaultRubyVM(module);
    vm.eval(event.data.code);
    self.postMessage({
      output: output.join("\n") || "(no output)",
      error: errors.length ? errors.join("\n") : undefined,
    });
  } catch (error) {
    self.postMessage({
      output: output.join("\n"),
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
};
