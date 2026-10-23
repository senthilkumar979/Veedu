import { useEffect, useState } from "react";

const webUrl =
  import.meta.env.VITE_VEEDU_WEB_URL ?? "http://localhost:3000";

export function App() {
  const [nativeNote, setNativeNote] = useState(
    "Global shortcut ⌘⇧V / Ctrl+Shift+V fires a native notification when Tauri is running.",
  );

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen("veedu://quick-add", () => {
          setNativeNote("Quick Add shortcut received — use ⌘K in the web UI.");
        });
      } catch {
        /* browser vite preview without Tauri */
      }
    })();
    return () => unlisten?.();
  }, []);

  async function testNotify() {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("notify_quick_add");
      setNativeNote("Native notification sent.");
    } catch {
      setNativeNote("Native APIs unavailable (open via tauri:dev).");
    }
  }

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
        <button type="button" className="hintBtn" onClick={() => void testNotify()}>
          Test native notify
        </button>
      </header>
      <iframe title="Veedu" src={webUrl} className="frame" />
      <footer className="foot">{nativeNote}</footer>
    </div>
  );
}
