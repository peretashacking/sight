extern crate dirs;
use std::process::Command;

#[tauri::command]
pub fn msworkspace() {
    let path = dirs::home_dir()
        .unwrap()
        .join("Documents/Macsploit Workspace");
    if path.exists() {
        Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .expect("Failed to open Macsploit Workspace");
    } else {
        println!("Macsploit Workspace not found");
    }
}

#[tauri::command]
pub fn msautoexecute() {
    let path = dirs::home_dir()
        .unwrap()
        .join("Documents/Macsploit Automatic Execution");
    if path.exists() {
        Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .expect("Failed to open Macsploit Automatic Execution");
    } else {
        println!("Macsploit Automatic Execution not found");
    }
}
