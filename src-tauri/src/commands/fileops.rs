use std::fs;
use tauri::AppHandle;
use tauri::dialog;
use serde::Deserialize;

#[tauri::command]
pub async fn save_file(app_handle: AppHandle, content: String, options: Option<SaveOptions>) -> Result<String, String> {
    // Default filter for Lua scripts if none provided
    let options = options.unwrap_or_else(|| SaveOptions {
        filters: Some(vec![FileFilter {
            name: Some("Lua Script".to_string()),
            extensions: Some(vec!["lua".to_string()]),
            mime_types: None,
        }]),
    });

    // Show save dialog
    let mut dialog_builder = dialog::FileDialogBuilder::new();
    
    // Add filters if provided
    if let Some(filters) = &options.filters {
        for filter in filters {
            if let (Some(name), Some(extensions)) = (&filter.name, &filter.extensions) {
                let ext_refs: Vec<&str> = extensions.iter().map(|s| s.as_str()).collect();
                dialog_builder = dialog_builder.add_filter(name, &ext_refs);
            }
        }
    } else {
        // Default filter
        dialog_builder = dialog_builder.add_filter("Lua Script", &["lua"]);
    }
    
    // Show the save dialog
    let file_path = dialog_builder.save_file().await;
    
    // Check if user canceled the dialog
    let file_path = match file_path {
        Some(path) => path,
        None => return Err("Save dialog canceled by user".to_string()),
    };

    // Write content to file
    match fs::write(&file_path, content) {
        Ok(_) => {
            println!("[Save] File saved successfully to {:?}", file_path);
            Ok(file_path.to_string_lossy().to_string())
        },
        Err(e) => {
            println!("[Save] Error saving file: {:?}", e);
            Err(format!("Failed to save file: {}", e))
        },
    }
}

// Define SaveOptions struct to match JavaScript options object
#[derive(Deserialize)]
pub struct SaveOptions {
    pub filters: Option<Vec<FileFilter>>,
}

// Define FileFilter struct to match JavaScript filter options
#[derive(Deserialize)]
pub struct FileFilter {
    pub name: Option<String>,
    pub extensions: Option<Vec<String>>,
    pub mime_types: Option<Vec<String>>,
}