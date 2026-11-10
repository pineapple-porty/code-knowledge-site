type Stage = {
  label: string;
  title: string;
  description: string;
  sample: string;
};

const compilerMaps: Record<
  "python" | "lua",
  { name: string; title: string; stages: Stage[]; facts: { label: string; value: string }[] }
> = {
  python: {
    name: "CPYTHON",
    title: "From source text to the evaluation loop",
    stages: [
      {
        label: "01 · INPUT",
        title: "Source",
        description: "The expression and statements you write.",
        sample: "value = 6 * 7",
      },
      {
        label: "02 · PARSE",
        title: "Syntax tree",
        description: "Tokens are organized into an AST.",
        sample: "Assign(value, Multiply)",
      },
      {
        label: "03 · COMPILE",
        title: "Code object",
        description: "Instructions and supporting tables are assembled.",
        sample: "bytecode · constants · names",
      },
      {
        label: "04 · EXECUTE",
        title: "Eval loop",
        description: "A frame advances through instructions.",
        sample: "load → store → call",
      },
    ],
    facts: [
      { label: "COMPILED UNIT", value: "code object" },
      { label: "CONTAINS", value: "bytecode · constants · names" },
      { label: "EXECUTED BY", value: "the CPython evaluation loop" },
    ],
  },
  lua: {
    name: "LUA 5.4",
    title: "From Lua source to register instructions",
    stages: [
      {
        label: "01 · INPUT",
        title: "Source",
        description: "A function and its arithmetic expression.",
        sample: "return width * height",
      },
      {
        label: "02 · PARSE",
        title: "Function body",
        description: "The parser recognizes expressions and scope.",
        sample: "local names · expressions",
      },
      {
        label: "03 · COMPILE",
        title: "Prototype",
        description: "The compiler emits bytecode for virtual registers.",
        sample: "R0 · R1 → R2",
      },
      {
        label: "04 · EXECUTE",
        title: "Lua VM",
        description: "The virtual machine dispatches each instruction.",
        sample: "MUL R2, R0, R1",
      },
    ],
    facts: [
      { label: "COMPILED UNIT", value: "function prototype" },
      { label: "OPERANDS", value: "virtual registers" },
      { label: "EXECUTED BY", value: "the Lua 5.4 virtual machine" },
    ],
  },
};

export default function CompilerDiagram({ language }: { language: "python" | "lua" }) {
  const map = compilerMaps[language];

  return (
    <section id="compiler-diagram" className={`compiler-diagram compiler-diagram-${language}`} aria-label={`${map.name} compiler diagram`}>
      <div className="compiler-diagram-heading">
        <div>
          <span className="compiler-diagram-kicker">THE COMPILE PATH</span>
          <h3>{map.title}</h3>
        </div>
        <span className="compiler-version">{map.name}</span>
      </div>

      <div className="compiler-flow" role="list" aria-label="Compiler stages">
        {map.stages.map((stage, index) => (
          <div className="compiler-flow-part" key={stage.title}>
            <div className="compiler-stage" role="listitem">
              <span className="compiler-stage-label">{stage.label}</span>
              <h4>{stage.title}</h4>
              <p>{stage.description}</p>
              <code>{stage.sample}</code>
            </div>
            {index < map.stages.length - 1 && (
              <span className="compiler-arrow" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="compiler-facts" aria-label={`${map.name} compiler details`}>
        {map.facts.map((fact) => (
          <div className="compiler-fact" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
