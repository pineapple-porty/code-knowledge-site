export type Language = "python" | "lua";
export type Topic = {
  id: string; title: string; eyebrow: string; description: string; code: string;
  concepts: { title: string; text: string }[];
  runtime: { opcode: string; meaning: string }[];
  sources: { label: string; url: string }[];
};

export const topics: Record<Language, Topic[]> = {
  python: [
    {
      id: "bytecode-first-look", title: "A first look at bytecode", eyebrow: "COMPILER",
      description: "CPython compiles each code block into a code object before the evaluation loop executes it. A code object holds the compiled instruction stream and related metadata, including constants and names. The dis module can display the interpreter's bytecode in a readable form. That bytecode is a CPython implementation detail and can change between releases.",
      sources: [
        { label: "CPython bytecode", url: "https://docs.python.org/3/library/dis.html" },
        { label: "Code objects", url: "https://docs.python.org/3/c-api/code.html" },
      ],
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
      description: "Python code executes in blocks such as modules, function bodies, and class definitions. Each running block has an execution frame that records its state and connects it to the previous frame. Function-local names follow Python's scope rules, while global and built-in names use separate namespaces. When a function returns, execution resumes in its caller.",
      sources: [
        { label: "Execution model", url: "https://docs.python.org/3/reference/executionmodel.html" },
        { label: "Frame objects", url: "https://docs.python.org/3/reference/datamodel.html#frame-objects" },
      ],
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
      description: "CPython tracks references to objects using reference counts. Reference counting alone cannot reclaim an unreachable cycle when its objects continue to refer to one another. Python's cyclic garbage collector supplements reference counting by finding cycles among tracked containers. The gc module provides controls and inspection tools for that collector.",
      sources: [
        { label: "Reference counting", url: "https://docs.python.org/3/c-api/refcounting.html" },
        { label: "Garbage collector", url: "https://docs.python.org/3/library/gc.html" },
      ],
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
      description: "Tables are Lua's principal data structure and can represent sequences, mappings, or records. In Lua 5.4's implementation, elements are kept in array and hash parts chosen according to the keys and contents. A missing key evaluates to nil, and assigning nil removes that key. The length operator has special rules for sequences with holes, so it is not always a count of every table entry.",
      sources: [
        { label: "Lua 5.4 manual", url: "https://www.lua.org/manual/5.4/manual.html#2.1" },
        { label: "Table implementation", url: "https://www.lua.org/source/5.4/ltable.c.html" },
      ],
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
      description: "Lua compiles source into bytecode before its virtual machine executes it. Lua 5.4 uses a register-based VM, so instructions refer to virtual registers rather than relying on an operand stack. The luac utility can save compiled chunks, mainly to speed loading and check syntax offline; precompiling does not make a chunk execute faster. The bytecode format is specific to Lua versions and is not a portable interchange format.",
      sources: [
        { label: "Lua 5.4 manual", url: "https://www.lua.org/manual/5.4/" },
        { label: "luac compiler", url: "https://www.lua.org/manual/5.4/luac.html" },
      ],
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
      description: "Lua manages memory automatically and reclaims objects that can no longer be reached during normal execution. Its 5.4 collector supports incremental and generational modes. Incremental collection spreads mark-and-sweep work across steps; generational mode checks newer objects frequently and can later run a major pass over all objects. An unreachable cycle can be collected even when its objects refer to one another.",
      sources: [
        { label: "Incremental collection", url: "https://www.lua.org/manual/5.4/manual.html#2.5.1" },
        { label: "Generational collection", url: "https://www.lua.org/manual/5.4/manual.html#2.5.2" },
      ],
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
