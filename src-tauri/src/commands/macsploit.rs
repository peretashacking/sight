use tauri::State;
use crate::{msapi, AppState};

#[tauri::command]
pub fn attach(state: State<crate::AppState>, port: u16) -> Result<(), String> {
    let mut api_lock = state.api.lock().unwrap();
    if api_lock.is_none() {
        match connect(port) {
            Ok(api) => {
                *api_lock = Some(api);
                Ok(())
            }
            Err(e) => Err(e)
        }
    } else {
        let alive = api_lock.as_mut().unwrap().is_alive();
        match alive {
            Ok(true) => Err("AlreadyInjected".into()),
            Ok(false) => {
                match connect(port) {
                    Ok(api) => {
                        *api_lock = Some(api);
                        Ok(())
                    }
                    Err(e) => Err(e)
                }
            },
            Err(e) => Err(e)
        }
    }
}

fn connect(port: u16) -> Result<msapi::MsApi, String> {
    match msapi::MsApi::connect(port) {
        Ok(mut api) => {
            let alive = api.is_alive();
            match alive {
                Ok(true) => {
                    Ok(api)
                }
                Ok(false) => Err("SocketNotAlive".into()),
                Err(e) => Err(e)
            }
        }
        Err(e) => Err(e)
    }
}

#[tauri::command]
pub fn execute(state: State<AppState>, script: String) -> Result<(), String> {
    let mut api_lock = state.api.lock().unwrap();
    if let Some(api) = api_lock.as_mut() {
        match api.is_alive() {
            Ok(true) => {
                api.send_script(script)?;
                Ok(())
            }
            Ok(false) => Err("NotInjected".into()),
            Err(e) => Err(e)
        }
    } else {
        Err("NotInjected".into())
    }
}

#[tauri::command]
pub fn update_setting(state: State<AppState>, key: String, value: bool) -> Result<(), String> {
    let mut api_lock = state.api.lock().unwrap();
    if let Some(api) = api_lock.as_mut() {
        match api.is_alive() {
            Ok(true) => {
                api.send_setting(key, value.to_string())?;
                Ok(())
            }
            Ok(false) => Err("NotInjected".into()),
            Err(e) => Err(e)
        }
    } else {
        Err("NotInjected".into())
    }
}