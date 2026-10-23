use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn notify_quick_add(app: AppHandle) -> Result<(), String> {
    app.notification()
        .builder()
        .title("Veedu")
        .body("Quick Add — open the web app and press ⌘K / Ctrl+K")
        .show()
        .map_err(|e| e.to_string())?;
    let _ = app.emit("veedu://quick-add", ());
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![notify_quick_add])
        .setup(|app| {
            let handle = app.handle().clone();
            let shortcut = Shortcut::new(Some(Modifiers::SUPER.union(Modifiers::SHIFT)), Code::KeyV);
            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = notify_quick_add(handle.clone());
                }
            })?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Veedu desktop");
}
