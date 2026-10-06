# Veedu Desktop (Tauri)

Thin Tauri 2 shell that loads the shared Veedu web UI (`VITE_VEEDU_WEB_URL`, default `http://localhost:3000`).

## Requirements

- Rust toolchain (`rustup`)
- Platform WebView deps (Linux: `webkit2gtk`, etc.)
- Node/pnpm for the Vite shell

## Commands

```bash
pnpm --filter @veedu/desktop install
pnpm --filter @veedu/web dev   # in another terminal
pnpm --filter @veedu/desktop tauri:dev
```

## Native stubs (documented)

Until full native packaging lands (especially macOS-signed builds):

| Capability | Status |
|---|---|
| System tray | Stub — wire `tauri-plugin-tray` |
| Global shortcut Quick Add | Stub — `Cmd/Ctrl+Shift+V` |
| Native notifications | Stub — `tauri-plugin-notification` |
| Native file picker | Stub — `tauri-plugin-dialog` |
| Launch at startup | Stub |

The Vite shell builds without Rust. Full `tauri build` requires the Rust toolchain on the host.
