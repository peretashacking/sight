use std::fs;
use std::io::Write;
use std::env;
use std::path::PathBuf;
use std::collections::HashMap;

#[tauri::command]
pub fn read_setting() -> Result<HashMap<String, bool>, String> {
    let setting_path = get_home_dir().join("Downloads").join("ms-settings");
    if !setting_path.exists() {
        return Err("Setting file does not exist".into())
    }

    let setting_str = fs::read_to_string(setting_path).expect("Failed to read settings");
    let mut settings = HashMap::new();

    for setting in setting_str.lines() {
        let mut parts = setting.split_whitespace();

        if let (Some(key), Some(value)) = (parts.next(), parts.next()) {
            let value = value.parse::<bool>().unwrap_or(true);
            settings.insert(key.to_string(), value);
        }
    }

    Ok(settings)
}

#[tauri::command]
pub fn write_setting(key: String, value: bool) -> Result<(), String> {
    let setting_path = get_home_dir().join("Downloads").join("ms-settings");
    if !setting_path.exists() {
        return Err("Setting file does not exist".into())
    }

    let mut settings = read_setting().expect("Failed to read settings");
    settings.insert(key, value);

    let mut setting_str = String::new();
    for (key, value) in settings {
        setting_str.push_str(&format!("{} {}\n", key, value));
    }

    let mut file = fs::File::create(&setting_path).expect("Failed to create settings");
    file.write_all(setting_str.as_bytes()).expect("Failed to write settings");

    Ok(())
}

fn get_home_dir() -> PathBuf {
    let home_dir = env::var("HOME").expect("Failed to get home directory");
    return PathBuf::from(home_dir);
}