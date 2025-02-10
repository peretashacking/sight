#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod msapi;
mod commands;

use std::sync::Mutex;
use commands::macsploit;
use commands::settings;
use commands::robloxcontrol;
use commands::openfs;

pub struct AppState {
    pub api: std::sync::Mutex<Option<msapi::MsApi>>
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            api: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            macsploit::execute,
            macsploit::attach,
            macsploit::update_setting,
            settings::read_setting,
            settings::write_setting,
            robloxcontrol::start_roblox,
            robloxcontrol::kill_roblox,
            robloxcontrol::watch_logs,
            openfs::msworkspace,
            openfs::msautoexecute
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested {
                api, ..
            } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
