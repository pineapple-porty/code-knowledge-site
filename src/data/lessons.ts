export type Language = "python" | "lua" | "bash" | "ruby";
export type Topic = {
  id: string; title: string; eyebrow: string; description: string; code: string;
  concepts: { title: string; text: string }[];
  details: { title: string; paragraphs: string[] }[];
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
      details: [
        {
          title: "Source becomes a code object",
          paragraphs: [
            "CPython does not execute the characters in a function body directly. It parses source into a syntax tree, checks how names are used, and compiles the result into a code object. That object contains a sequence of interpreter instructions alongside constants, referenced names, and other metadata needed later.",
            "A code object describes work; it is not itself the function's changing runtime state. The same compiled function can be called many times, each call running with its own arguments and execution frame. The built-in compile function and the dis module make parts of this boundary visible from Python.",
          ],
        },
        {
          title: "Instructions refer to stored values",
          paragraphs: [
            "A short expression such as 6 * 7 needs more than a printed list of words. The compiler records the literal values in a constants table and emits instructions that load those values, perform an operation, and store or return the result. Names used by the code are tracked separately so the interpreter can resolve them in the appropriate namespace.",
            "The exact instruction stream is an implementation detail, not a translation that every Python implementation must use. CPython can change instruction names, grouping, and optimizations between releases while preserving the language's visible behavior.",
          ],
        },
        {
          title: "The evaluation loop runs the code",
          paragraphs: [
            "When execution starts, CPython's interpreter advances through the code object while maintaining a frame for that running block. Instructions manipulate values, access names, call functions, and branch to other parts of the instruction stream. A function call creates another active execution context and eventually returns a value to its caller.",
            "Looking at disassembly is useful for seeing the machinery behind an expression, but it is not a performance guarantee. The interpreter may specialize operations while a program runs, and details vary by Python version. Treat a disassembly as a snapshot of one CPython build rather than a stable file format.",
          ],
        },
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
      details: [
        {
          title: "A running block has a frame",
          paragraphs: [
            "A Python code block is a unit such as a module, a function body, or a class body. When the interpreter executes a block, a frame carries the current instruction position and the values needed for that execution. If one function calls another, the new call becomes the active frame while the caller's state remains available underneath it.",
            "This is why a traceback can show a chain of calls: each frame identifies where that particular invocation was executing. Returning from a function finishes its frame and resumes the suspended caller with the returned value.",
          ],
        },
        {
          title: "Name lookup follows scope rules",
          paragraphs: [
            "Python decides a function's local names by analyzing assignments in the whole function body. A name assigned there is local unless the function declares it global or nonlocal, even if a read appears before the assignment. This compile-time rule explains errors that can surprise people who expect every name to be searched outward automatically.",
            "A function can also refer to names from an enclosing function. Python preserves those closure values in cells so an inner function can keep using them after the outer call has returned. Global and built-in names follow separate lookup paths from fast local variables.",
          ],
        },
        {
          title: "Frames connect code and live state",
          paragraphs: [
            "A code object is reusable instructions; a frame is one execution of those instructions. Arguments and local values belong to the call, so two calls of the same function can share a code object without sharing their local variable state.",
            "The public frame inspection APIs are useful for debugging and tracing, but CPython's internal frame representation can change. Programs should rely on Python's documented scope and execution behavior rather than depending on low-level storage details.",
          ],
        },
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
      details: [
        {
          title: "Reference counts reclaim many objects promptly",
          paragraphs: [
            "In CPython, references to an object are counted. Creating another reference increases that count; dropping a reference decreases it. When the count reaches zero, CPython can usually release the object immediately, which is why a simple object may disappear soon after its last reference is removed.",
            "This behavior is specific to CPython and should not be treated as a promise made by the Python language. Other Python implementations can manage memory differently, and even in CPython a program should avoid depending on exact cleanup timing for important work.",
          ],
        },
        {
          title: "Cycles need tracing",
          paragraphs: [
            "Reference counting alone cannot reclaim a cycle whose members keep referring to one another. In the example above, each Node has a reference to the other, so both counts can stay above zero even after the program drops its own names for them.",
            "CPython's cyclic garbage collector supplements reference counting by examining tracked container objects and detecting groups that are no longer reachable from the program. This allows unreachable cycles to be reclaimed without requiring the objects to manually break their links.",
          ],
        },
        {
          title: "Collection is not a cleanup callback",
          paragraphs: [
            "An object becoming unreachable makes it eligible for reclamation; it does not mean a particular line of code synchronously runs a destructor. The collector decides when to inspect cycles, and program behavior should not depend on a specific collection happening at a specific moment.",
            "The gc module provides controls and statistics for investigation, but explicit resource management is still the right choice for files, sockets, and other resources with a required lifetime. A context manager makes that lifetime clear instead of relying on garbage collection.",
          ],
        },
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
      details: [
        {
          title: "One table type covers many shapes",
          paragraphs: [
            "Lua does not have separate built-in array, dictionary, and record types. A table maps keys to values, so a sequence of numbered entries, a set of named fields, and a mixed collection can all use the same table value. This keeps the language small while letting programs choose the shape that fits their data.",
            "In Lua 5.4's implementation, a table may use an array part for suitable positive integer keys and a hash part for other keys. That layout is an internal optimization: scripts should use table operations rather than assume a fixed memory arrangement.",
          ],
        },
        {
          title: "Missing values and sequence boundaries",
          paragraphs: [
            "Reading a key that is not present returns nil. Assigning nil to a table field removes that field, so nil is also the marker for absence rather than a value that can be stored in an ordinary table entry.",
            "The length operator is most predictable for a sequence whose integer keys run from 1 without holes. If entries are missing in the middle, there may be more than one valid boundary, and the length result should not be treated as a count of every key in the table.",
          ],
        },
        {
          title: "Tables are mutable and resized as needed",
          paragraphs: [
            "Adding and removing keys changes the table over time. The implementation can resize its internal storage as the set of keys changes, so a table is not a fixed-size array even when a program first fills it with numbered values.",
            "This flexibility is useful for scripting and prototypes, but it makes the distinction between a dense sequence and a general mapping important. Use the length operator for sequence-like data, and use explicit iteration when a table may contain sparse or mixed keys.",
          ],
        },
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
      details: [
        {
          title: "The compiler turns expressions into instructions",
          paragraphs: [
            "Lua source is parsed and compiled before the virtual machine runs it. The compiler checks the shape of expressions and statements, organizes function bodies, and emits instructions that describe operations such as loading constants, accessing tables, making calls, and returning values.",
            "The luac utility exposes this boundary: it can check a source file and write a compiled chunk. That chunk is useful for loading or inspecting Lua code, but it is not a universal executable format that every Lua version or unrelated language can understand.",
          ],
        },
        {
          title: "Lua 5.4 uses virtual registers",
          paragraphs: [
            "Lua's virtual machine is register-based. An instruction names virtual registers that hold operands and results, instead of expecting every operation to push and pop values on one shared evaluation stack. The registers are part of the VM's abstract execution model, not physical CPU registers.",
            "The compiler chooses registers while translating expressions and can reuse a register after its previous temporary value is no longer needed. This makes instruction sequences compact, while keeping the mechanics of register allocation hidden from ordinary Lua code.",
          ],
        },
        {
          title: "Bytecode belongs to an implementation version",
          paragraphs: [
            "The bytecode format describes the internals of a particular Lua implementation. Instruction sets and chunk formats can change between releases, so a saved chunk should be used with a compatible Lua runtime rather than treated as a stable interchange format.",
            "For understanding a program, the source remains the clearest and most portable representation. Disassembling a chunk is valuable for curiosity and debugging, but exact opcodes are details of that build, not part of Lua's language-level contract.",
          ],
        },
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
      details: [
        {
          title: "Reachability tells Lua what is still live",
          paragraphs: [
            "Lua's collector starts from roots the running program can still access, such as values on the stack and reachable globals. It follows references outward and marks objects it can reach. An object not reached during a collection is eligible to be reclaimed.",
            "Because the collector traces references, it can reclaim a group of tables that refer only to one another. A simple reference-counting scheme would leave such a cycle alive, but tracing sees that the entire group is disconnected from the program's live roots.",
          ],
        },
        {
          title: "Incremental work spreads out collection",
          paragraphs: [
            "Lua 5.4 supports incremental collection, which divides garbage-collection work into steps rather than requiring every collection to perform one full pass at once. The runtime can interleave those steps with program execution, trading pause length against the amount of work done per step.",
            "The collector's pacing settings affect when and how much work is performed. They do not make collection a deterministic response to a particular assignment, so programs should not rely on dropping a reference to trigger an immediate collection.",
          ],
        },
        {
          title: "Generational mode focuses on new objects",
          paragraphs: [
            "Lua 5.4 also offers a generational mode. It treats recently created objects as a group worth checking more frequently because many temporary objects become unreachable quickly, while longer-lived objects can be examined less often.",
            "Both modes solve the same general problem—finding unreachable objects—but schedule the work differently. They are runtime strategies, not changes to Lua's table or variable semantics, and the right behavior depends on the workload.",
          ],
        },
      ],
      runtime: [
        { opcode: "NEWTABLE", meaning: "Allocate a table object that the collector will track." },
        { opcode: "SETFIELD", meaning: "Store a named field, creating an object reference." },
        { opcode: "RETURN", meaning: "Return from the function; local references leave scope." },
      ],
    },
  ],
  bash: [
    {
      id: "bash-expansion",
      title: "How Bash interprets text",
      eyebrow: "SHELL INTERPRETER",
      description: "Bash reads shell commands as text and interprets them; a script is not normally compiled into a separate program. It parses the command, performs expansions and redirections, then runs a built-in or starts another program. Bash has internal parsing steps, but those are not the same as producing compiled bytecode or a standalone executable. The snippets here are reference-only, so they cannot create or delete files on your device.",
      sources: [
        { label: "What is Bash?", url: "https://www.gnu.org/software/bash/manual/bash.html#What-is-Bash_003f" },
        { label: "Shell operation", url: "https://www.gnu.org/software/bash/manual/bash.html#Shell-Operation" },
        { label: "Simple commands", url: "https://www.gnu.org/software/bash/manual/bash.html#Simple-Commands" },
      ],
      code: "name=\"Ada Lovelace\"\nprintf 'Hello, %s\\n' \"$name\"",
      concepts: [
        { title: "Read and parse", text: "Bash recognizes shell syntax and determines which words, operators, and commands belong together." },
        { title: "Expand and redirect", text: "It performs substitutions and sets up input or output redirections before running a command." },
        { title: "Run in the shell environment", text: "Bash executes built-ins itself or starts external programs, so effects depend on the commands and environment." },
      ],
      details: [
        {
          title: "A shell is an interpreter and a command environment",
          paragraphs: [
            "Bash is both an interactive shell and a language interpreter for shell scripts. A terminal gives it a place to read commands, while a script supplies those commands from a text file. In either case, Bash interprets shell syntax in the context of the current environment rather than translating the whole script into a standalone program first.",
            "That environment matters: it includes variables, the current directory, open input and output streams, available commands, and permissions. A line of shell text can therefore have effects beyond the text itself when Bash runs it.",
          ],
        },
        {
          title: "Parsing comes before command execution",
          paragraphs: [
            "Bash first recognizes the structure of the command: words, operators, quotes, pipelines, compound commands, and redirections. It then performs expansions such as parameter substitution and filename matching, removes quoting syntax where appropriate, and prepares the command's arguments and streams.",
            "Once that work is done, Bash runs a built-in command inside the shell process or starts an external program. These stages explain why quoting and expansion rules matter: the program receives the words Bash constructs, not the original characters exactly as typed.",
          ],
        },
        {
          title: "Why a Bash script has no ordinary compile step",
          paragraphs: [
            "A Bash script is ordinarily read and interpreted by Bash. The shell may parse and organize commands internally, but that is different from generating a portable bytecode file or a machine-code executable for later execution. Bash's syntax also interacts closely with process creation, streams, environment variables, and operating-system commands.",
            "Utilities that wrap scripts into binaries are separate tools, not Bash's normal compiler pipeline. For this wiki, Bash examples are displayed as text and never sent to a shell, so even a command that removes or creates files cannot affect the device showing the page.",
          ],
        },
      ],
      runtime: [],
    },
    {
      id: "bash-family-shells",
      title: "Other shells around Bash",
      eyebrow: "SHELL FAMILIES",
      description: "Bash is one of several command interpreters used on Unix-like systems, and related shells do not all accept exactly the same syntax. Zsh and KornShell (ksh) have their own features and share parts of the wider Bourne-style shell tradition. Dash is a small shell commonly used for POSIX-style sh scripts, where portability matters more than Bash-specific features. Fish serves a similar command-line role but deliberately uses different syntax, so Bash scripts do not run unchanged in it.",
      sources: [
        { label: "GNU shell-family overview", url: "https://www.gnu.org/software/autoconf/manual/autoconf-2.69/html_node/Shellology.html" },
        { label: "Z Shell manual", url: "https://zsh.sourceforge.io/Doc/Release/index.html" },
        { label: "KornShell project", url: "https://github.com/ksh93/ksh" },
        { label: "Dash manual", url: "https://manpages.debian.org/unstable/dash/dash.1.en.html" },
        { label: "Fish documentation", url: "https://fishshell.com/docs/4.5/" },
      ],
      code: "printf 'These examples are written for Bash.\\n'",
      concepts: [
        { title: "Related does not mean identical", text: "Bash, Zsh, and KornShell share familiar command-line patterns, but their options and scripting details differ." },
        { title: "Portable sh is a subset", text: "Dash targets POSIX-style sh scripts and does not provide every Bash extension." },
        { title: "Fish has distinct syntax", text: "Fish is another interactive shell, but it is not intended to run Bash scripts unchanged." },
      ],
      details: [
        {
          title: "Bourne-style shells share a family resemblance",
          paragraphs: [
            "Bash, Zsh, and KornShell are separate command interpreters with many familiar conventions: variables, quoting, command pipelines, redirections, and shell scripts. Their histories and feature sets overlap, but the details are not identical. A script that depends on a Bash extension may need changes before another shell can run it.",
            "Zsh is popular as an interactive shell and provides its own completion, globbing, and configuration features. KornShell is another longstanding command and scripting language. Both are useful comparisons, but neither should be treated as merely a different name for Bash.",
          ],
        },
        {
          title: "Dash is focused on POSIX sh",
          paragraphs: [
            "Dash is a small shell commonly used to run scripts written for the POSIX sh language. Its goal is not to implement every Bash convenience; scripts that use Bash arrays, `[[ ... ]]`, or other Bash-only syntax may fail under Dash.",
            "This distinction matters in automation. A script intended for `/bin/sh` should use portable shell syntax, while a script relying on Bash features should explicitly request Bash. The shebang and the shell used to invoke a file determine which interpreter reads it.",
          ],
        },
        {
          title: "Fish is similar in purpose, not syntax",
          paragraphs: [
            "Fish is a command-line shell designed for interactive use, but it deliberately uses syntax that differs from the Bourne-style shell family. Its variable and control-flow forms are not drop-in replacements for Bash syntax, even though both shells help people launch programs and work at a command line.",
            "Calling a shell 'Bash-like' can mean similar use rather than full compatibility. When portability matters, identify the exact shell language the script targets and use that shell to run it.",
          ],
        },
      ],
      runtime: [],
    },
    {
      id: "bash-pipelines",
      title: "Pipelines connect small commands",
      eyebrow: "COMMAND FLOW",
      description: "A Bash pipeline connects the standard output of one command to the standard input of the next. Each command can focus on a small transformation, such as filtering lines or counting them. Bash normally runs the commands in a pipeline as separate processes. The pipeline's final status usually comes from its last command unless the pipefail option is enabled.",
      sources: [
        { label: "Pipelines", url: "https://www.gnu.org/software/bash/manual/bash.html#Pipelines" },
        { label: "The set builtin", url: "https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin" },
      ],
      code: "printf '%s\\n' alpha beta gamma | grep 'a' | wc -l",
      concepts: [
        { title: "Text moves through streams", text: "The vertical bar connects one process's standard output to the next process's standard input." },
        { title: "Each command transforms data", text: "A pipeline combines ordinary commands without requiring one large program to perform every step." },
        { title: "Status has rules", text: "By default, a pipeline's status follows its last command; pipefail changes this behavior when an earlier command fails." },
      ],
      details: [
        {
          title: "A pipe joins output to input",
          paragraphs: [
            "In a pipeline, the vertical bar connects the standard output of one command to the standard input of the next. The first program writes bytes into the pipe, and the following program reads them as its input. A longer pipeline repeats that connection to pass a stream through several focused commands.",
            "This composition is one of the shell's defining ideas: a text filter can work with files, other commands, or generated output without knowing where the stream came from. The sample counts matching lines by sending printed words through grep and then wc.",
          ],
        },
        {
          title: "Pipeline commands run as processes",
          paragraphs: [
            "Bash normally starts the commands in a pipeline as separate processes. It wires their input and output streams together, waits for them according to shell rules, and collects their exit statuses. Each process can make progress as data flows rather than waiting for a complete intermediate file.",
            "A pipe is not the same as a shell variable or a permanent file: it is a communication channel between running commands. Redirections can connect a pipeline to files or other streams when a script needs to save or source the data.",
          ],
        },
        {
          title: "The final status can hide earlier failure",
          paragraphs: [
            "By default, the status of a pipeline is normally the status of its last command. If an early command fails but a later command successfully processes the input it received, the pipeline may still appear successful to a script.",
            "The `pipefail` option changes this rule so a pipeline reports a failure when a command in it fails. Scripts that use pipelines as part of automation should choose their error-handling behavior deliberately rather than assuming the last command tells the whole story.",
          ],
        },
      ],
      runtime: [],
    },
    {
      id: "bash-functions",
      title: "Functions package a workflow",
      eyebrow: "AUTOMATION",
      description: "A Bash function gives a name to a group of shell commands so that the group can be reused. Its positional parameters are available as $1, $2, and so on, just like arguments to a script. Variables declared with local are limited to the function's dynamic scope. Functions make repeated shell tasks easier to read and compose.",
      sources: [
        { label: "Shell functions", url: "https://www.gnu.org/software/bash/manual/bash.html#Shell-Functions" },
        { label: "Shell parameters", url: "https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameters" },
      ],
      code: "greet() {\n  local name=${1:-friend}\n  printf 'Hello, %s\\n' \"$name\"\n}\n\ngreet \"Ada\"",
      concepts: [
        { title: "Arguments are positional", text: "A function receives its arguments through numbered positional parameters such as $1." },
        { title: "Local variables stay scoped", text: "The local builtin limits a variable's visibility to a function and its dynamically nested calls." },
        { title: "Functions fit into scripts", text: "Named command groups can be reused throughout a shell script or interactive session." },
      ],
      details: [
        {
          title: "A function names a reusable command group",
          paragraphs: [
            "A Bash function gives a name to a sequence of shell commands. Defining a function makes that group available in the shell; invoking its name runs the body with the arguments supplied at the call site. The function can use the same shell features as a script, including conditionals, pipelines, and redirections.",
            "Functions are useful when a script repeats a workflow or when a name makes a multi-step operation easier to understand. They can also be used interactively, where they provide a lightweight way to customize the current shell session.",
          ],
        },
        {
          title: "Arguments and local variables",
          paragraphs: [
            "Arguments passed to a function appear as positional parameters such as `$1` and `$2`; `$#` reports how many were supplied. They are separate from the shell's ordinary named variables, so functions can pass different values each time they are called.",
            "The `local` builtin creates a variable local to a function's dynamic scope. Nested functions called from that function can see the local value, which is useful but different from lexical block scope in many other languages. Quoting a parameter such as `\"$name\"` also keeps a value containing spaces as one argument.",
          ],
        },
        {
          title: "Return status and output are different",
          paragraphs: [
            "A shell function can write output to standard output, and it can set an exit status with `return`. The status is a small success-or-failure signal for the caller; it is not a general return value containing arbitrary data.",
            "When a script needs a function to produce data, it commonly prints that data and captures the output, while using the exit status to report whether the operation succeeded. Keeping those channels separate makes shell automation easier to compose.",
          ],
        },
      ],
      runtime: [],
    },
  ],
  ruby: [
    {
      id: "ruby-objects",
      title: "Objects, messages, and methods",
      eyebrow: "OBJECT MODEL",
      description: "Ruby organizes values as objects, and a method call asks a receiver to perform an operation. When no receiver is written explicitly, self is used. The receiver's class and its ancestors participate in finding the method. This message-oriented model lets scripts combine simple objects and reusable behavior with concise syntax.",
      sources: [
        { label: "Calling methods", url: "https://docs.ruby-lang.org/en/3.4/syntax/calling_methods_rdoc.html" },
        { label: "Object class", url: "https://docs.ruby-lang.org/en/3.4/Object.html" },
      ],
      code: "name = \"Ada\"\nmessage = \"Hello, #{name}\"\nputs message.upcase",
      concepts: [
        { title: "Every call has a receiver", text: "An explicit receiver appears before the method name; otherwise Ruby uses self." },
        { title: "Methods return values", text: "The result of a method call can be assigned, passed to another method, or used in a larger expression." },
        { title: "Calls can be chained", text: "A returned object can become the receiver of the next call in an expression." },
      ],
      details: [
        {
          title: "A method call sends a message to a receiver",
          paragraphs: [
            "In `message.upcase`, the object held by `message` is the receiver and `upcase` is the method name. Ruby asks that object to handle the call. If a receiver is omitted, the current value of `self` supplies the context for the call.",
            "The call's result is another Ruby object, so it can be assigned to a variable, passed as an argument, or become the receiver of another call. This is why method chains can read like a sequence of operations on a value.",
          ],
        },
        {
          title: "Lookup follows the object's method path",
          paragraphs: [
            "Ruby resolves a method by looking through the receiver's class and its ancestors, with singleton methods and included modules affecting the lookup path. The same method name can therefore produce different behavior for different receiver objects.",
            "This dynamic dispatch is central to Ruby's object model. A method call is not simply a textual function name: the receiver determines which implementation is found, while visibility rules and the active lookup chain shape what can be called.",
          ],
        },
        {
          title: "Objects make small scripts composable",
          paragraphs: [
            "Strings, arrays, numbers, and user-defined values all offer methods suited to their behavior. A script can combine those methods without needing a separate syntax for every kind of value.",
            "The convenience comes with runtime lookup: typos in a method name or an unexpected receiver type may only become apparent when that call executes. Reading the receiver and the return value together often makes Ruby code easier to understand.",
          ],
        },
      ],
      runtime: [],
    },
    {
      id: "ruby-blocks",
      title: "Blocks carry behavior",
      eyebrow: "ITERATION",
      description: "A Ruby block is a piece of code associated with a method call. A method can run the block with yield, optionally passing values that become block parameters. Enumerable methods such as map use blocks to describe what to do with each element. This lets a short script express repeated work without writing the iteration machinery itself.",
      sources: [
        { label: "Ruby methods and blocks", url: "https://docs.ruby-lang.org/en/3.4/syntax/methods_rdoc.html#label-Blocks" },
        { label: "Enumerable", url: "https://docs.ruby-lang.org/en/3.4/Enumerable.html" },
      ],
      code: "numbers = [1, 2, 3, 4]\nsquares = numbers.map { |n| n * n }\nputs squares.join(\", \")",
      concepts: [
        { title: "A block belongs to a call", text: "Blocks are passed to methods using braces or do/end syntax." },
        { title: "Yield runs the block", text: "A method can invoke its attached block with yield and pass it arguments." },
        { title: "Enumerable builds on blocks", text: "Methods like map and select apply the supplied block to collection elements." },
      ],
      details: [
        {
          title: "A block carries behavior into a method call",
          paragraphs: [
            "A block is a piece of Ruby code attached to a method invocation. Braces are common for short expressions, while `do` and `end` often make multi-line blocks easier to read. The method decides whether and when to run the block, so the block's behavior is supplied by the caller.",
            "This gives a method a way to accept an operation without knowing its exact contents. A collection method can focus on traversing values while a block describes what should happen to each value.",
          ],
        },
        {
          title: "Yield transfers control to the block",
          paragraphs: [
            "A method that accepts a block can call `yield` to run it. Values supplied to yield become block parameters, and control returns to the method after the block finishes. A method can yield once, several times, or conditionally, depending on what the operation means.",
            "Blocks can also refer to variables from the surrounding scope, which makes them useful for concise callbacks and resource-handling patterns. Their execution is still part of the method call, not a separate process or a string of code being compiled elsewhere.",
          ],
        },
        {
          title: "Enumerable turns iteration into a description",
          paragraphs: [
            "The Enumerable module provides methods such as `map`, `select`, and `each` for objects that can yield successive elements. `map` returns a new collection of transformed values, while `select` keeps only the values for which the block is truthy.",
            "In the example, the block expresses the transformation `n * n` and `map` handles visiting each number. This separates the question of what to do from the mechanics of iterating over the array, a pattern that makes small Ruby scripts concise.",
          ],
        },
      ],
      runtime: [],
    },
    {
      id: "ruby-gc",
      title: "Ruby's garbage collector",
      eyebrow: "MEMORY",
      description: "CRuby manages objects with a mark-and-sweep garbage collector. During a collection, it identifies objects that are still reachable and reclaims objects that are not. The collector also uses generations to treat recently created objects differently from long-lived ones. Ruby exposes controls and statistics through the GC module.",
      sources: [
        { label: "Ruby GC module", url: "https://docs.ruby-lang.org/en/3.4/GC.html" },
        { label: "Ruby ObjectSpace", url: "https://docs.ruby-lang.org/en/3.4/ObjectSpace.html" },
      ],
      code: "items = Array.new(1_000) { |n| \"entry-#{n}\" }\nputs GC.stat(:heap_live_slots)\nitems = nil",
      concepts: [
        { title: "Reachable objects stay live", text: "The collector follows references from program roots to determine which objects remain in use." },
        { title: "Generations group lifetimes", text: "Generational collection handles young and old objects differently to reduce collection work." },
        { title: "Collection timing is automatic", text: "Dropping a reference makes an object eligible for collection but does not promise when collection occurs." },
      ],
      details: [
        {
          title: "CRuby finds objects by tracing references",
          paragraphs: [
            "CRuby's garbage collector manages objects allocated by a running Ruby program. It identifies references from live roots and follows them through the object graph; objects it cannot reach are no longer needed by the program and can be reclaimed.",
            "Tracing lets the collector find unreachable cycles. Two objects may still point to one another after all useful references to them have disappeared, but that cycle is collectible when nothing reachable from the program leads to it.",
          ],
        },
        {
          title: "Marking and sweeping reclaim memory",
          paragraphs: [
            "At a high level, mark-and-sweep collection marks objects that are reachable and sweeps through the heap to reclaim unmarked ones. The details of when a collection starts and how much work it performs belong to the runtime, not to an individual assignment in Ruby code.",
            "CRuby also uses generations so recently allocated objects can be handled differently from objects that have survived collections. This is based on the common pattern that many objects are short-lived, while some remain in use much longer.",
          ],
        },
        {
          title: "Eligibility is not an exact schedule",
          paragraphs: [
            "Setting a variable to `nil` removes that particular reference, but it does not promise that collection happens on that line. Another reference may still keep the object alive, and the runtime chooses collection timing based on its own state and settings.",
            "The GC module exposes controls and statistics for observing CRuby's collector. These interfaces help explain memory behavior, but code should not depend on undocumented heap layouts or assume that object finalization occurs at a precise moment.",
          ],
        },
      ],
      runtime: [],
    },
  ],
};
