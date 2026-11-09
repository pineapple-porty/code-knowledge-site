"use client";
import { useEffect, useMemo, useState } from "react";
import CodePlayground from "@/components/CodePlayground";
import { topics, type Language } from "@/data/lessons";

export default function KnowledgeSite() {
  const [language, setLanguage] = useState<Language>("python");
  const [activeId, setActiveId] = useState(topics.python[0].id);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);
  const currentTopics = topics[language];
  const topic = currentTopics.find((item) => item.id === activeId) || currentTopics[0];
  const visibleTopics = useMemo(() => currentTopics.filter((item) => [item.title, item.eyebrow, item.description].join(" ").toLowerCase().includes(query.toLowerCase())), [currentTopics, query]);

  useEffect(() => {
    const saved = localStorage.getItem("runtime-notes-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
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
        <div className="topbar-right"><span className="offline-badge"><i /> IN-BROWSER DEMOS</span><button className="theme-toggle" onClick={toggleTheme} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " theme"}>{theme === "dark" ? "☼" : "◐"}</button><a className="github-link" href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">GitHub <span>↗</span></a></div>
      </header>
      <div className="workspace" id="top">
        <aside className="sidebar" aria-label="Topic index">
          <div className="sidebar-kicker">COLLECTION INDEX <span>01</span></div>
          <div className="language-switch" role="tablist" aria-label="Browse by language"><button role="tab" aria-selected={language === "python"} className={language === "python" ? "selected" : ""} onClick={() => changeLanguage("python")}><span className="language-symbol python-mark">Py</span> Python</button><button role="tab" aria-selected={language === "lua"} className={language === "lua" ? "selected" : ""} onClick={() => changeLanguage("lua")}><span className="language-symbol lua-mark">Lu</span> Lua</button></div>
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic" aria-label="Search topics" /><kbd>/</kbd></label>
          <div className="lesson-group-label">{language === "python" ? "PYTHON TOPICS" : "LUA 5.4 TOPICS"}<span>{visibleTopics.length.toString().padStart(2, "0")}</span></div>
          <div className="lesson-list">{visibleTopics.map((item, index) => <button key={item.id} className={"lesson-link " + (item.id === topic.id ? "active" : "")} onClick={() => setActiveId(item.id)}><span className="lesson-index">{String(index + 1).padStart(2, "0")}</span><span className="lesson-link-title">{item.title}</span><span className="lesson-arrow">↗</span></button>)}{visibleTopics.length === 0 && <p className="no-results">Nothing in the index matches “{query}”.</p>}</div>
          <div className="sidebar-bottom"><div className="learning-note"><span className="note-icon">✳</span><p>A personal collection.<br /><strong>Things worth a closer look.</strong></p></div><div className="sidebar-credit">PYTHON, LUA & OTHER CURIOSITIES <span>✳</span></div></div>
        </aside>
        <div className="main-column" id="topics">
          <section className="hero"><div className="hero-eyebrow"><span className="eyebrow-line" /> A PERSONAL WIKI OF SOFTWARE CURIOSITIES</div><div className="hero-row"><div><h1>Small worlds inside<br />everyday <span>code.</span></h1><p className="hero-subtitle">A personal collection of language details, compiler quirks, and runtime behaviors I find interesting enough to keep around.</p></div><div className="hero-stamp"><span>ODD</span><span>✳</span><span>GOOD</span></div></div><div className="hero-meta"><span><i className="meta-dot" /> PYTHON + LUA</span><span>NOTES ON THE MACHINERY</span><span>JUST THINGS I FIND INTERESTING</span></div></section>
          <article className="lesson-article" key={topic.id}>
            <div className="article-heading"><div><div className="article-eyebrow">{topic.eyebrow}<span className="eyebrow-divider">/</span>{language === "lua" ? "LUA 5.4" : "CPYTHON"}</div><h2>{topic.title}<span className="title-period">.</span></h2></div></div>
            <p className="lesson-description">{topic.description}</p>
            <div className="section-rule"><span>✳</span><span>A LITTLE EXAMPLE</span><button onClick={copyCode}>{copied ? "Copied ✓" : "Copy snippet ↗"}</button></div>
            <CodePlayground key={language + "-" + topic.id} language={language} initialCode={topic.code} />
            <section className="concept-section"><div className="section-rule"><span>✳</span><span>WHAT MAKES IT INTERESTING</span><span className="section-rule-tail">A FEW DETAILS</span></div><div className="concept-grid">{topic.concepts.map((concept, index) => <div className="concept-card" key={concept.title}><span className="concept-number">✳ {String(index + 1).padStart(2, "0")}</span><h3>{concept.title}</h3><p>{concept.text}</p></div>)}</div></section>
            <section className="instruction-section"><div className="section-rule"><span>✳</span><span>FROM INSIDE THE RUNTIME</span><span className="section-rule-tail">IMPLEMENTATION DETAILS</span></div><div className="instruction-list">{topic.runtime.map((row, index) => <div className="instruction-row" key={row.opcode}><span className="instruction-index">{String(index + 1).padStart(2, "0")}</span><code>{row.opcode}</code><p>{row.meaning}</p><span className="instruction-type">VM</span></div>)}</div><p className="caveat">Small implementation note: details can vary across runtime versions. These are interesting landmarks, not a promise of an exact disassembly.</p></section>
            <footer className="article-footer"><span>END OF NOTE <i>✳</i></span><button onClick={() => { const index = currentTopics.findIndex((item) => item.id === topic.id); setActiveId(currentTopics[(index + 1) % currentTopics.length].id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Another topic <span>→</span></button></footer>
          </article>
          <footer className="site-footer" id="about"><span>RUNTIME NOTES <span className="brand-dot">✳</span> A HOBBY WIKI</span><span>PYTHON + LUA · A PERSONAL COLLECTION</span><a href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></footer>
        </div>
        <aside className="right-rail" aria-label="Topic details"><div className="rail-block"><div className="rail-label">IN THIS ARTICLE</div><a href="#topics" className="rail-anchor"><span className="anchor-dot" />{topic.title}</a><div className="rail-mini-rule" />{topic.concepts.map((concept, index) => <a href="#topics" key={concept.title} className="rail-sub-anchor"><span>{String(index + 1).padStart(2, "0")}</span>{concept.title}</a>)}</div><div className="rail-block runtime-card"><div className="rail-label">THE RUNTIME</div><div className="runtime-name"><span className={"language-dot " + language} />{language === "lua" ? "Wasmoon · Lua 5.4" : "Pyodide · Python"}</div><p>{language === "lua" ? "The official Lua VM compiled to WebAssembly. The little demo runs in a disposable browser worker." : "CPython compiled to WebAssembly. The little demo runs in a disposable browser worker."}</p><div className="runtime-status"><i /> LOCAL CODE DEMO</div></div><div className="rail-quote"><span>“</span><p>The fun is in finding the unexpected machinery behind an ordinary line of code.</p><small>A NOTE FROM THE COLLECTION</small></div><div className="rail-privacy"><span className="privacy-icon">◉</span><p>Play with the snippet.<br /><strong>It stays on your device.</strong></p></div></aside>
      </div>
    </main>
  );
}
