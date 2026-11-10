"use client";
import { useEffect, useMemo, useState } from "react";
import CodePlayground from "@/components/CodePlayground";
import CompilerDiagram from "@/components/CompilerDiagram";
import ReferenceSnippet from "@/components/ReferenceSnippet";
import { topics, type Language } from "@/data/lessons";

const languageOrder: Language[] = ["python", "lua", "bash", "ruby"];
const languageInfo: Record<Language, { label: string; mark: string; topics: string; article: string; runtime: string; runtimeDescription: string }> = {
  python: { label: "Python", mark: "Py", topics: "PYTHON TOPICS", article: "CPYTHON", runtime: "Pyodide · Python", runtimeDescription: "CPython compiled to WebAssembly. The demo runs in a disposable browser worker." },
  lua: { label: "Lua", mark: "Lu", topics: "LUA 5.4 TOPICS", article: "LUA 5.4", runtime: "Wasmoon · Lua 5.4", runtimeDescription: "The official Lua VM compiled to WebAssembly. The demo runs in a disposable browser worker." },
  bash: { label: "Bash", mark: "Ba", topics: "BASH TOPICS", article: "GNU BASH", runtime: "Bash · Reference shell", runtimeDescription: "Bash examples are reference snippets. Shell commands are not executed in the browser." },
  ruby: { label: "Ruby", mark: "Rb", topics: "RUBY TOPICS", article: "CRUBY 3.4", runtime: "ruby.wasm · Ruby 3.4", runtimeDescription: "CRuby compiled to WebAssembly. The demo runs locally in a disposable browser worker." },
};

export default function KnowledgeSite() {
  const [language, setLanguage] = useState<Language>("python");
  const [activeId, setActiveId] = useState(topics.python[0].id);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);
  const currentTopics = topics[language];
  const topic = currentTopics.find((item) => item.id === activeId) || currentTopics[0];
  const isCompilerTopic = topic.eyebrow === "COMPILER";
  const compilerLanguage = language === "python" || language === "lua" ? language : null;
  const visibleTopics = useMemo(() => currentTopics.filter((item) => [item.title, item.eyebrow, item.description].join(" ").toLowerCase().includes(query.toLowerCase())), [currentTopics, query]);

  useEffect(() => {
    const saved = localStorage.getItem("runtime-notes-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
    }
  }, []);
  function changeLanguage(next: Language) { setLanguage(next); setActiveId(topics[next][0].id); setQuery(""); }
  async function copyCode() {
    try { await navigator.clipboard.writeText(topic.code); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { setCopied(false); }
  }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("runtime-notes-theme", next);
  }

  return (
    <main className={"site-shell theme-" + theme}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Runtime Notes home"><span className="brand-mark"><span /><span /><span /></span><span>runtime<span className="brand-dot">.</span>notes</span></a>
        <nav className="topnav" aria-label="Primary navigation"><a className="nav-active" href="#topics">Topics</a><a href="#about">About</a></nav>
        <div className="topbar-right"><span className="offline-badge"><i /> LOCAL LANGUAGE EXAMPLES</span><button className="theme-toggle" onClick={toggleTheme} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " theme"}>{theme === "dark" ? "☼" : "◐"}</button><a className="github-link" href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">GitHub <span>↗</span></a></div>
      </header>
      <div className="workspace" id="top">
        <aside className="sidebar" aria-label="Topic index">
          <div className="sidebar-kicker">COLLECTION INDEX <span>01</span></div>
          <div className="language-switch" role="tablist" aria-label="Browse by language">
            {languageOrder.map((item) => (
              <button key={item} role="tab" aria-selected={language === item} className={language === item ? "selected" : ""} onClick={() => changeLanguage(item)}>
                <span className={`language-symbol ${item}-mark`}>{languageInfo[item].mark}</span>{languageInfo[item].label}
              </button>
            ))}
          </div>
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic" aria-label="Search topics" /><kbd>/</kbd></label>
          <div className="lesson-group-label">{languageInfo[language].topics}<span>{visibleTopics.length.toString().padStart(2, "0")}</span></div>
          <div className="lesson-list">{visibleTopics.map((item, index) => <button key={item.id} className={"lesson-link " + (item.id === topic.id ? "active" : "")} onClick={() => setActiveId(item.id)}><span className="lesson-index">{String(index + 1).padStart(2, "0")}</span><span className="lesson-link-title">{item.title}</span><span className="lesson-arrow">↗</span></button>)}{visibleTopics.length === 0 && <p className="no-results">Nothing in the index matches “{query}”.</p>}</div>
           <div className="sidebar-bottom"><div className="learning-note"><span className="note-icon">✳</span><p>A personal collection.<br /><strong>Things worth a closer look.</strong></p></div><div className="sidebar-credit">PYTHON, LUA, BASH & RUBY <span>✳</span></div></div>
        </aside>
        <div className="main-column" id="topics">
          <section className="hero"><div className="hero-eyebrow"><span className="eyebrow-line" /> A PERSONAL WIKI OF SOFTWARE CURIOSITIES</div><div className="hero-row"><div><h1>Small worlds inside<br />everyday <span>code.</span></h1><p className="hero-subtitle">A personal collection of language details, compiler quirks, and runtime behaviors I find interesting enough to keep around.</p></div><div className="hero-stamp"><span>ODD</span><span>✳</span><span>GOOD</span></div></div><div className="hero-meta"><span><i className="meta-dot" /> PYTHON · LUA · BASH · RUBY</span><span>NOTES ON THE MACHINERY</span><span>JUST THINGS I FIND INTERESTING</span></div></section>
          <article className="lesson-article" key={topic.id}>
            <div className="article-heading"><div><div className="article-eyebrow">{topic.eyebrow}<span className="eyebrow-divider">/</span>{languageInfo[language].article}</div><h2>{topic.title}<span className="title-period">.</span></h2></div></div>
            {isCompilerTopic && compilerLanguage && <CompilerDiagram language={compilerLanguage} />}
            <p className={"lesson-description" + (isCompilerTopic ? " lesson-description-featured" : "")}>{topic.description}</p>
            <nav className="topic-sources" aria-label={`Sources for ${topic.title}`}>
              <span>Sources</span>
              {topic.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  {source.label}<span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </nav>
            <div className="section-rule"><span>✳</span><span>A LITTLE EXAMPLE</span><button onClick={copyCode}>{copied ? "Copied ✓" : "Copy snippet ↗"}</button></div>
            {language === "bash" ? <ReferenceSnippet code={topic.code} /> : <CodePlayground key={language + "-" + topic.id} language={language} initialCode={topic.code} />}
            {!isCompilerTopic && <section className="concept-section"><div className="section-rule"><span>✳</span><span>WHAT MAKES IT INTERESTING</span><span className="section-rule-tail">A FEW DETAILS</span></div><div className="concept-grid">{topic.concepts.map((concept, index) => <div className="concept-card" key={concept.title}><span className="concept-number">✳ {String(index + 1).padStart(2, "0")}</span><h3>{concept.title}</h3><p>{concept.text}</p></div>)}</div></section>}
            {!isCompilerTopic && topic.runtime.length > 0 && <section className="instruction-section"><div className="section-rule"><span>✳</span><span>FROM INSIDE THE RUNTIME</span><span className="section-rule-tail">IMPLEMENTATION DETAILS</span></div><div className="instruction-list">{topic.runtime.map((row, index) => <div className="instruction-row" key={row.opcode}><span className="instruction-index">{String(index + 1).padStart(2, "0")}</span><code>{row.opcode}</code><p>{row.meaning}</p><span className="instruction-type">VM</span></div>)}</div><p className="caveat">Small implementation note: details can vary across runtime versions. These are interesting landmarks, not a promise of an exact disassembly.</p></section>}
            <footer className="article-footer"><span>END OF NOTE <i>✳</i></span><button onClick={() => { const index = currentTopics.findIndex((item) => item.id === topic.id); setActiveId(currentTopics[(index + 1) % currentTopics.length].id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Another topic <span>→</span></button></footer>
          </article>
          <footer className="site-footer" id="about"><span>RUNTIME NOTES <span className="brand-dot">✳</span> A HOBBY WIKI</span><span>PYTHON · LUA · BASH · RUBY</span><a href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></footer>
        </div>
         <aside className="right-rail" aria-label="Topic details"><div className="rail-block"><div className="rail-label">IN THIS ARTICLE</div><a href="#topics" className="rail-anchor"><span className="anchor-dot" />{topic.title}</a><div className="rail-mini-rule" />{isCompilerTopic ? ["Source", "Parse", "Compile", "Execute"].map((label, index) => <a href="#compiler-diagram" key={label} className="rail-sub-anchor"><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>) : topic.concepts.map((concept, index) => <a href="#topics" key={concept.title} className="rail-sub-anchor"><span>{String(index + 1).padStart(2, "0")}</span>{concept.title}</a>)}</div><div className="rail-block runtime-card"><div className="rail-label">THE RUNTIME</div><div className="runtime-name"><span className={"language-dot " + language} />{languageInfo[language].runtime}</div><p>{languageInfo[language].runtimeDescription}</p><div className="runtime-status"><i />{language === "bash" ? "REFERENCE ONLY" : "LOCAL CODE DEMO"}</div></div><div className="rail-quote"><span>“</span><p>{language === "bash" ? "Read the shell snippet." : "The fun is in finding the unexpected machinery behind an ordinary line of code."}</p><small>A NOTE FROM THE COLLECTION</small></div><div className="rail-privacy"><span className="privacy-icon">◉</span><p>{language === "bash" ? <>Commands are not run.<br /><strong>Only the reference is shown.</strong></> : <>Play with the snippet.<br /><strong>It stays on your device.</strong></>}</p></div></aside>
      </div>
    </main>
  );
}
