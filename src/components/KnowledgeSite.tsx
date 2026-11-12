"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CodePlayground from "@/components/CodePlayground";
import CompilerDiagram from "@/components/CompilerDiagram";
import ReferenceSnippet from "@/components/ReferenceSnippet";
import { topics, type Language, type Topic } from "@/data/lessons";

const languageOrder: Language[] = ["python", "lua", "bash", "ruby"];
const languageInfo: Record<Language, { label: string; mark: string; topics: string; article: string; runtime: string; runtimeDescription: string }> = {
  python: { label: "Python", mark: "Py", topics: "PYTHON TOPICS", article: "CPYTHON", runtime: "Pyodide · Python", runtimeDescription: "CPython compiled to WebAssembly. The demo runs in a disposable browser worker." },
  lua: { label: "Lua", mark: "Lu", topics: "LUA 5.4 TOPICS", article: "LUA 5.4", runtime: "Wasmoon · Lua 5.4", runtimeDescription: "The official Lua VM compiled to WebAssembly. The demo runs in a disposable browser worker." },
  bash: { label: "Bash", mark: "Ba", topics: "BASH TOPICS", article: "GNU BASH", runtime: "Bash · Reference shell", runtimeDescription: "Bash examples are reference snippets. Shell commands are not executed in the browser." },
  ruby: { label: "Ruby", mark: "Rb", topics: "RUBY TOPICS", article: "CRUBY 3.4", runtime: "ruby.wasm · Ruby 3.4", runtimeDescription: "CRuby compiled to WebAssembly. The demo runs locally in a disposable browser worker." },
};

function topicPath(language: Language, slug: string) {
  return `/topics/${language}/${slug}/`;
}

function TopicLink({ language, topic, active = false, index }: { language: Language; topic: Topic; active?: boolean; index: number }) {
  return (
    <Link href={topicPath(language, topic.id)} className={"lesson-link" + (active ? " active" : "")} aria-current={active ? "page" : undefined}>
      <span className="lesson-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="lesson-link-title">{topic.title}</span>
      <span className="lesson-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

export default function KnowledgeSite({ language: routeLanguage, slug }: { language?: Language; slug?: string }) {
  const isTopicPage = Boolean(routeLanguage && slug);
  const [indexLanguage, setIndexLanguage] = useState<Language>(routeLanguage || "python");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const language = routeLanguage || indexLanguage;
  const currentTopics = topics[language];
  const topic = isTopicPage ? currentTopics.find((item) => item.id === slug) : undefined;
  const visibleTopics = useMemo(
    () => currentTopics.filter((item) => [
      item.title,
      item.eyebrow,
      item.description,
      ...item.details.flatMap((detail) => [detail.title, ...detail.paragraphs]),
    ].join(" ").toLowerCase().includes(query.toLowerCase())),
    [currentTopics, query],
  );
  const isCompilerTopic = topic?.eyebrow === "COMPILER";
  const compilerLanguage = language === "python" || language === "lua" ? language : null;

  useEffect(() => {
    const saved = localStorage.getItem("runtime-notes-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && target?.tagName !== "INPUT" && target?.tagName !== "TEXTAREA") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("runtime-notes-theme", next);
  }

  async function copyCode() {
    if (!topic) return;
    try {
      await navigator.clipboard.writeText(topic.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const nextTopic = topic
    ? currentTopics[(currentTopics.findIndex((item) => item.id === topic.id) + 1) % currentTopics.length]
    : undefined;

  return (
    <main className={"site-shell theme-" + theme}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Runtime Notes home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span>runtime<span className="brand-dot">.</span>notes</span>
        </Link>
        <nav className="topnav" aria-label="Primary navigation">
          <Link className={isTopicPage ? "" : "nav-active"} href="/">Topics</Link>
          <a href="/#about">About</a>
        </nav>
        <div className="topbar-right">
          <span className="offline-badge"><i /> LOCAL LANGUAGE EXAMPLES</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " theme"}>{theme === "dark" ? "LIGHT" : "DARK"}</button>
          <a className="github-link" href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
        </div>
      </header>
      <div className="workspace" id="top">
        <aside className="sidebar" aria-label="Topic index">
          <div className="sidebar-kicker">COLLECTION INDEX <span>01</span></div>
          <div className="language-switch" role="tablist" aria-label="Browse by language">
            {languageOrder.map((item) => (
              <Link
                key={item}
                role="tab"
                aria-selected={language === item}
                className={language === item ? "selected" : ""}
                href={isTopicPage ? topicPath(item, topics[item][0].id) : "#topic-index"}
                onClick={!isTopicPage ? () => { setIndexLanguage(item); setQuery(""); } : undefined}
              >
                <span className={`language-symbol ${item}-mark`}>{languageInfo[item].mark}</span>{languageInfo[item].label}
              </Link>
            ))}
          </div>
          <label className="search-box"><span aria-hidden="true">⌕</span><input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic" aria-label="Search topics" /><kbd>/</kbd></label>
          <div className="lesson-group-label">{languageInfo[language].topics}<span>{visibleTopics.length.toString().padStart(2, "0")}</span></div>
          <div className="lesson-list">
            {visibleTopics.map((item) => <TopicLink key={item.id} language={language} topic={item} active={topic?.id === item.id} index={currentTopics.indexOf(item)} />)}
            {visibleTopics.length === 0 && <p className="no-results">Nothing in the index matches “{query}”.</p>}
          </div>
          <div className="sidebar-bottom">
            <div className="learning-note"><span className="note-icon" aria-hidden="true">R</span><p>A personal collection.<br /><strong>Things worth a closer look.</strong></p></div>
            <div className="sidebar-credit">PYTHON, LUA, BASH & RUBY <span>R</span></div>
          </div>
        </aside>

        <div className="main-column" id="topics">
          {!isTopicPage ? (
            <>
              <section className="hero">
                <div className="hero-eyebrow"><span className="eyebrow-line" /> A PERSONAL WIKI OF SOFTWARE CURIOSITIES</div>
                <div className="hero-row">
                  <div>
                    <h1>Small worlds inside<br />everyday <span>code.</span></h1>
                    <p className="hero-subtitle">A personal collection of language details, compiler quirks, and runtime behaviors I find interesting enough to keep around.</p>
                  </div>
                  <div className="hero-stamp"><span>ODD</span><span>·</span><span>GOOD</span></div>
                </div>
                <div className="hero-meta"><span><i className="meta-dot" /> PYTHON · LUA · BASH · RUBY</span><span>NOTES ON THE MACHINERY</span><span>JUST THINGS I FIND INTERESTING</span></div>
              </section>
              <section className="home-index" id="topic-index" aria-label={`${languageInfo[language].label} topic index`}>
                <div className="index-heading"><h2>Browse the collection</h2><span>{languageInfo[language].topics} · {visibleTopics.length.toString().padStart(2, "0")}</span></div>
                {visibleTopics.length ? (
                  <div className="index-topic-list">
                    {visibleTopics.map((item, index) => (
                      <Link href={topicPath(language, item.id)} className="index-topic" key={item.id}>
                        <span className="index-topic-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="index-topic-copy"><h4>{item.title}</h4><p>{item.description}</p></span>
                        <span className="index-topic-arrow" aria-hidden="true">↗</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="index-empty">No topics match “{query}”. Try another phrase.</p>}
              </section>
              <footer className="site-footer" id="about"><span>RUNTIME NOTES <span className="brand-dot">·</span> A HOBBY WIKI</span><span>PYTHON · LUA · BASH · RUBY</span><a href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></footer>
            </>
          ) : topic ? (
            <article className="lesson-article" key={language + "-" + topic.id}>
              <div className="article-heading">
                <div>
                  <div className="article-eyebrow">{topic.eyebrow}<span className="eyebrow-divider">/</span>{languageInfo[language].article}</div>
                  <h2>{topic.title}<span className="title-period">.</span></h2>
                </div>
              </div>
              <p className={"lesson-description" + (isCompilerTopic ? " lesson-description-featured" : "")}>{topic.description}</p>
              {isCompilerTopic && compilerLanguage && <CompilerDiagram language={compilerLanguage} />}

              {topic.details.length > 0 && (
                <section className="details-section" aria-label="Topic details">
                  <div className="details-kicker">A CLOSER LOOK</div>
                  {topic.details.map((detail, index) => (
                    <section className="detail-block" id={`detail-${index + 1}`} key={detail.title}>
                      <h3>{detail.title}</h3>
                      {detail.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                    </section>
                  ))}
                </section>
              )}

              <section className="example-section" aria-label="Code example">
                <div className="section-rule"><span>R</span><span>A LITTLE EXAMPLE</span><button onClick={copyCode}>{copied ? "Copied" : "Copy snippet ↗"}</button></div>
                {language === "bash" ? <ReferenceSnippet code={topic.code} /> : <CodePlayground key={language + "-" + topic.id} language={language} initialCode={topic.code} />}
              </section>

              {!isCompilerTopic && topic.runtime.length > 0 && (
                <section className="instruction-section">
                  <div className="section-rule"><span>R</span><span>FROM INSIDE THE RUNTIME</span><span className="section-rule-tail">IMPLEMENTATION DETAILS</span></div>
                  <div className="instruction-list">{topic.runtime.map((row, index) => <div className="instruction-row" key={row.opcode}><span className="instruction-index">{String(index + 1).padStart(2, "0")}</span><code>{row.opcode}</code><p>{row.meaning}</p><span className="instruction-type">VM</span></div>)}</div>
                  <p className="caveat">Small implementation note: details can vary across runtime versions. These are interesting landmarks, not a promise of an exact disassembly.</p>
                </section>
              )}

              <nav className="topic-sources" aria-label={`Sources for ${topic.title}`}>
                <span>Sources</span>
                {topic.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<span aria-hidden="true"> ↗</span></a>)}
              </nav>
              <footer className="article-footer"><span>END OF NOTE <i>R</i></span>{nextTopic && <Link href={topicPath(language, nextTopic.id)}>Another topic <span>→</span></Link>}</footer>
              <footer className="site-footer" id="about"><span>RUNTIME NOTES <span className="brand-dot">·</span> A HOBBY WIKI</span><span>PYTHON · LUA · BASH · RUBY</span><a href="https://github.com/pineapple-porty/code-knowledge-site" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a></footer>
            </article>
          ) : (
            <section className="not-found">
              <div className="article-eyebrow">TOPIC NOT FOUND</div>
              <h2>This note isn’t in the collection.</h2>
              <Link href="/">Return to the topic index →</Link>
            </section>
          )}
        </div>

        {isTopicPage && topic && (
          <aside className="right-rail" aria-label="Topic details">
            <div className="rail-block">
              <div className="rail-label">IN THIS ARTICLE</div>
              <a href="#topics" className="rail-anchor"><span className="anchor-dot" />{topic.title}</a>
              <div className="rail-mini-rule" />
              {topic.details.map((detail, index) => <a href={`#detail-${index + 1}`} key={detail.title} className="rail-sub-anchor"><span>{String(index + 1).padStart(2, "0")}</span>{detail.title}</a>)}
            </div>
            <div className="rail-block runtime-card"><div className="rail-label">THE RUNTIME</div><div className="runtime-name"><span className={"language-dot " + language} />{languageInfo[language].runtime}</div><p>{languageInfo[language].runtimeDescription}</p><div className="runtime-status"><i />{language === "bash" ? "REFERENCE ONLY" : "LOCAL CODE DEMO"}</div></div>
            <div className="rail-quote"><span aria-hidden="true">“</span><p>{language === "bash" ? "Read the shell snippet." : "The fun is in finding the unexpected machinery behind an ordinary line of code."}</p><small>A NOTE FROM THE COLLECTION</small></div>
            <div className="rail-privacy"><span className="privacy-icon" aria-hidden="true">●</span><p>{language === "bash" ? <>Commands are not run.<br /><strong>Only the reference is shown.</strong></> : <>Play with the snippet.<br /><strong>It stays on your device.</strong></>}</p></div>
          </aside>
        )}
      </div>
    </main>
  );
}
