import { LuaFactory } from "wasmoon";
type RunMessage = { code: string };
self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const output: string[] = [];
  let engine: Awaited<ReturnType<LuaFactory["createEngine"]>> | undefined;
  try {
    const wasmUrl = new URL("/wasm/glue.wasm", self.location.origin).href;
    engine = await new LuaFactory(wasmUrl).createEngine();
    engine.global.set("print", (...values: any[]) => { output.push(values.map((value) => String(value)).join("\t")); });
    await engine.doString(event.data.code);
    self.postMessage({ output: output.join("\n") || "(no output)" });
  } catch (error) {
    self.postMessage({ output: output.join("\n"), error: error instanceof Error ? error.message : String(error) });
  } finally { engine?.global.close(); }
};
