use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighScore {
    pub score: u32,
    pub round: u32,
    pub name: String,
}

fn score_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app data directory: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Could not create app data directory: {e}"))?;
    Ok(dir.join("highscore.json"))
}

#[tauri::command]
fn get_high_score(app: tauri::AppHandle) -> Result<HighScore, String> {
    let path = score_path(&app)?;
    match fs::read_to_string(path) {
        Ok(contents) => serde_json::from_str(&contents).map_err(|e| format!("Invalid high score file: {e}")),
        Err(_) => Ok(HighScore {
            score: 0,
            round: 0,
            name: "PLAYER".to_string(),
        }),
    }
}

#[tauri::command]
fn save_high_score(app: tauri::AppHandle, score: u32, round: u32) -> Result<HighScore, String> {
    let path = score_path(&app)?;
    let current = get_high_score(app.clone())?;
    let next = if score >= current.score {
        HighScore {
            score,
            round,
            name: "PLAYER".to_string(),
        }
    } else {
        current
    };
    let data = serde_json::to_string_pretty(&next).map_err(|e| format!("Could not serialize high score: {e}"))?;
    fs::write(path, data).map_err(|e| format!("Could not save high score: {e}"))?;
    Ok(next)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let _ = app.get_webview_window("main");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_high_score, save_high_score])
        .run(tauri::generate_context!())
        .expect("error while running Retro Simon");
}
