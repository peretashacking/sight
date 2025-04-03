// required for killroblox
use std::process::Command;

use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom};
use std::thread;
use std::time::Duration;
use tauri::Emitter;

#[tauri::command]
pub fn watch_logs(file_path: String, window: tauri::Window) {
    thread::spawn(move || {
        let file = OpenOptions::new().read(true).open(&file_path);

        if let Ok(mut file) = file {
            let mut reader = BufReader::new(file.try_clone().unwrap());
            let mut position = file.seek(SeekFrom::End(0)).unwrap();

            loop {
                file.seek(SeekFrom::Start(position)).unwrap();

                let mut new_lines = Vec::new();
                for line in reader.by_ref().lines() {
                    if let Ok(log) = line {
                        new_lines.push(log);
                    }
                }

                if !new_lines.is_empty() {
                    for log in new_lines {
                        window.emit("log_update", log).unwrap();
                    }
                }

                position = file.seek(SeekFrom::Current(0)).unwrap();
                thread::sleep(Duration::from_millis(500)); // Poll every 500ms
            }
        }
    });
}

#[tauri::command]
pub fn kill_roblox() {
    let pgrep_output = Command::new("pgrep")
        .arg("-f")
        .arg("RobloxPlayer")
        .output()
        .expect("Failed to execute pgrep");

    if pgrep_output.status.success() {
        let pids = String::from_utf8(pgrep_output.stdout).unwrap();
        for pid in pids.lines() {
            let kill_output = Command::new("kill")
                .arg("-9")
                .arg(pid)
                .output()
                .expect("Failed to execute kill");

            if kill_output.status.success() {
                println!("Successfully killed RobloxPlayer process (PID: {})", pid);
            } else {
                eprintln!(
                    "Failed to kill PID {}: {}",
                    pid,
                    String::from_utf8_lossy(&kill_output.stderr)
                );
            }
        }
    } else {
        eprintln!(
            "No RobloxPlayer processes found: {}",
            String::from_utf8_lossy(&pgrep_output.stderr)
        );
    }
}

#[tauri::command]
pub fn start_roblox() {
    Command::new("open")
        .arg("-a")
        .arg("Roblox")
        .spawn()
        .expect("Failed to open Roblox");
}
