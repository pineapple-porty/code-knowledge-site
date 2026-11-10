export default function ReferenceSnippet({ code }: { code: string }) {
  return (
    <section className="playground reference-snippet" aria-label="Bash reference snippet">
      <div className="playground-topline">
        <div className="file-tab">
          <span className="language-dot bash" />
          example.sh
        </div>
        <span className="editor-version">GNU Bash · reference only</span>
      </div>
      <pre className="reference-code"><code>{code}</code></pre>
      <div className="reference-note">
        <span aria-hidden="true">i</span>
        This Bash example is for reference; it is not run in the browser.
      </div>
    </section>
  );
}
