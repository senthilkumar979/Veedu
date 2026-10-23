# Veedu Desktop (Tauri)

Thin Tauri 2 shell that loads the shared Veedu web UI (`VITE_VEEDU_WEB_URL`, default `http://localhost:3000`).

## Requirements

- Rust toolchain (`rustup`)
- Platform WebView deps
- Node/pnpm for the Vite shell

## Commands

```bash
pnpm --filter @veedu/desktop install
pnpm --filter @veedu/web dev   # in another terminal
pnpm --filter @veedu/desktop tauri:dev
```

## Native features

| Capability | Status |
|---|---|
| Global shortcut Quick Add | **Wired** — `⌘⇧V` / `Ctrl+Shift+V` → native notification + `veedu://quick-add` event |
| Native notifications | **Wired** — `notify_quick_add` command + Settings “Test native notify” |
| System tray | Not yet — prefer OS notification + shortcut for MVP |
| Native file picker | Use web file inputs (Storage) for now |
| Launch at startup | Not yet |

The Vite shell builds without Rust. Full `tauri build` requires the Rust toolchain on the host.
