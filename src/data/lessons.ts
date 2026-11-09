export type Language = "python" | "lua";
export type Topic = {
  id: string; title: string; eyebrow: string; description: string; code: string;
  concepts: { title: string; text: string }[];
  runtime: { opcode: string; meaning: string }[];
};

export const topics: Record<Language, Topic[]> = {
  python: [
    {
      id: "bytecode-first-look", title: "A first look at bytecode", eyebrow: "COMPILER",
      description: "A single Python expression passes through a compiler before the virtual machine sees it. Code objects are one of the neat ideas hiding in that trip.",
      code: "value = 6 * 7\nprint(value)",
      concepts: [
        { title: "Compile, then evaluate", text: "CPython compiles source to code objects before the evaluation loop runs. The exact instruction sequence can change across Python versions." },
        { title: "Constants are data too", text: "Literal values are stored in a code object's constant table. Instructions refer to those entries rather than repeating the values." },
        { title: "The VM is a loop", text: "The interpreter repeatedly fetches an instruction, updates its frame, and moves to the next instruction or jump target." },
      ],
      runtime: [
        { opcode: "LOAD_CONST", meaning: "Push a constant value onto the evaluation stack." },
        { opcode: "STORE_NAME", meaning: "Bind a stack value to a name in the current namespace." },
        { opcode: "CALL", meaning: "Call a callable with the arguments prepared on the stack." },
      ],
    },
    {
      id: "frames-and-locals", title: "Frames, locals, and scope", eyebrow: "EXECUTION MODEL",
      description: "Each function call gets its own little execution frame: local values, a place to keep temporary results, and a pointer to the next instruction.",
      code: "def greet(name):\n    message = f\"Hello, {name}\"\n    return message\n\nprint(greet(\"Ada\"))",
      concepts: [
        { title: "A call creates a frame", text: "A frame tracks the code being evaluated, its local storage, the current instruction, and the value stack." },
        { title: "Locals aren't a dictionary", text: "Optimized function locals are stored in indexed slots. Global and dynamic namespace lookups follow different paths." },
        { title: "Returning unwinds state", text: "A return instruction hands a value back to the caller and discards the finished frame." },
      ],
      runtime: [
        { opcode: "MAKE_FUNCTION", meaning: "Create a function object from a code object and defaults." },
        { opcode: "LOAD_FAST", meaning: "Read a local variable from the active frame's fast-local storage." },
        { opcode: "RETURN_VALUE", meaning: "Return the top value from the frame to its caller." },
      ],
    },
    {
      id: "reference-counting", title: "Reference counting & GC", eyebrow: "MEMORY",
      description: "CPython has two memory-management tricks working together: reference counts for the everyday cases, and a collector that can untangle cycles.",
      code: "class Node:\n    def __init__(self):\n        self.next = None\n\na = Node()\nb = Node()\na.next = b\nb.next = a",
      concepts: [
        { title: "References keep objects alive", text: "In CPython, an object's reference count tracks the references currently pointing to it." },
        { title: "Cycles need a second pass", text: "Two objects can keep each other referenced after the rest of the program stops using them. The cyclic collector detects groups like this." },
        { title: "Reachability is the key", text: "The collector searches tracked containers for cycles that have no path back from live roots." },
      ],
      runtime: [
        { opcode: "LOAD_BUILD_CLASS", meaning: "Prepare the class construction process." },
        { opcode: "STORE_ATTR", meaning: "Assign an attribute to an object." },
        { opcode: "CALL", meaning: "Invoke a constructor or other callable." },
      ],
    },
  ],
  lua: [
    {
      id: "lua-tables", title: "What a Lua table really is", eyebrow: "DATA STRUCTURES",
      description: "Lua tables do a surprising amount of work. A single structure can behave like an array, a dictionary, or an object, depending on how you use it.",
      code: "local player = {\n  name = \"Mira\",\n  score = 42,\n}\n\nplayer.inventory = { \"map\", \"key\" }\nprint(player.name, player.score)",
      concepts: [
        { title: "One type, two parts", text: "Lua tables use an array part for suitable positive integer keys and a hash part for other keys. The VM chooses sizes based on the table's contents." },
        { title: "The nil boundary", text: "A missing key reads as nil. Assigning nil removes a table entry, so nil cannot be stored as a normal value." },
        { title: "Resizing is a runtime decision", text: "When a table grows, Lua may reallocate and rehash entries. A table is not a fixed-layout array." },
      ],
      runtime: [
        { opcode: "NEWTABLE", meaning: "Create a table, with size hints for its array and hash parts." },
        { opcode: "SETTABLE", meaning: "Set a key-value pair in the table." },
        { opcode: "GETTABLE", meaning: "Look up a value by key." },
      ],
    },
    {
      id: "lua-bytecode", title: "From Lua source to instructions", eyebrow: "COMPILER",
      description: "Lua 5.4 uses a register-based virtual machine. That choice gives its bytecode a very different feel from a stack-based interpreter.",
      code: "local function area(width, height)\n  return width * height\nend\n\nprint(area(8, 5))",
      concepts: [
        { title: "Registers, not an operand stack", text: "Lua 5.4 bytecode uses virtual registers. Instructions name the registers they read and write." },
        { title: "The compiler allocates registers", text: "As it compiles expressions, Lua assigns temporary values to registers and reuses them when their lifetimes end." },
        { title: "Version matters", text: "Lua bytecode is an implementation detail. Instruction formats can change between Lua releases and are not a portable file format." },
      ],
      runtime: [
        { opcode: "MUL", meaning: "Multiply numeric operands and write the result to a destination register." },
        { opcode: "RETURN", meaning: "Return values from the current function." },
        { opcode: "CALL", meaning: "Call a function with arguments held in registers." },
      ],
    },
    {
      id: "lua-gc", title: "Lua's garbage collector", eyebrow: "MEMORY",
      description: "Lua uses a tracing garbage collector, with incremental and generational modes. Cycles are ordinary: what matters is whether anything can still reach them.",
      code: "local function make_pair()\n  local left = {}\n  local right = {}\n  left.peer = right\n  right.peer = left\n  return left\nend\n\nlocal pair = make_pair()\npair = nil -- now unreachable",
      concepts: [
        { title: "Tracing from roots", text: "The collector follows references from roots such as the stack and globals to find live objects." },
        { title: "Cycles are collectible", text: "Unlike plain reference counting, a tracing collector can reclaim objects that only reference each other." },
        { title: "Collection is scheduled", text: "Lua's collector works incrementally and also supports generational mode; collection does not necessarily happen on the assignment that drops a reference." },
      ],
      runtime: [
        { opcode: "NEWTABLE", meaning: "Allocate a table object that the collector will track." },
        { opcode: "SETFIELD", meaning: "Store a named field, creating an object reference." },
        { opcode: "RETURN", meaning: "Return from the function; local references leave scope." },
      ],
    },
  ],
};
