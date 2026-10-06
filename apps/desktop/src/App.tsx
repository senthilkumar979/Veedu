const webUrl =
  import.meta.env.VITE_VEEDU_WEB_URL ?? "http://localhost:3000";

export function App() {
  return (
    <div className="shell">
      <header className="bar">
        <div className="brand">
          <span className="mark">V</span>
          <div>
            <strong>Veedu</strong>
            <p>Desktop shell</p>
          </div>
        </div>
        <p className="hint">Loads shared web UI · tray/shortcut stubs below</p>
      </header>
      <iframe title="Veedu" src={webUrl} className="frame" />
      <footer className="foot">
        Native stubs: system tray, global Quick Add shortcut (Cmd/Ctrl+Shift+V),
        native notifications, file picker — document in README until platform
        tooling (esp. macOS) is available in CI.
      </footer>
    </div>
  );
}
