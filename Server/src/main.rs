use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::{fs, io::Result};
use chrono::{Local, DateTime, Utc};
use const_format::formatcp;


// Define a base directory for backups
const BACKUP_DIR: &str = "./backup";
const BACKUP_FILE_NAME: &str = "latest.json";

const BACKUP_FILE_PATH: &str = formatcp!("{}/{}", BACKUP_DIR, BACKUP_FILE_NAME);

const ROUTE_PATH: &str = "/entries";

#[derive(Serialize, Deserialize)]
struct Category {
    key: i32,
    name: String,
    color: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct QA {
    key: i32,
    question: String,
    answer: String,
    category_id: i32,
}

#[derive(Serialize, Deserialize)]
struct Backup {
    categories: Vec<Category>,
    qas: Vec<QA>,
    last_updated: Option<DateTime<Utc>>
}

impl Default for Backup {
    fn default() -> Self {
        Self {
            categories: vec![],
            qas: vec![],
            last_updated: Some(Utc::now())
        }
    }
}

// handler to retrieve the latest entry
async fn get_entries() -> impl Responder {
    // read file
    match fs::read_to_string(&BACKUP_FILE_PATH) {
        Ok(contents) => HttpResponse::Ok().content_type("application/json").body(contents),
        Err(_) => HttpResponse::Ok().body("No backup entries on the server"), // Return empty backup if file doesn't exist
    }
}

// handler to save new entry
async fn save_entry(entry: web::Json<Backup>) -> impl Responder {
    let now = Utc::now(); // Current UTC time

    // convert web::Json<Backup> into Backup
    let mut new_backup = entry.into_inner();
    new_backup.last_updated = Some(now); // Update the timestamp

    // serialize and save the updated backup
    match fs::write(BACKUP_FILE_PATH, serde_json::to_string(&new_backup).unwrap()) {
        Ok(_) => HttpResponse::Ok().body(format!("Backup saved at {}", now)),
        Err(_) => HttpResponse::InternalServerError().body("Error saving backup"),
    }
}

#[actix_rt::main]
async fn main() -> Result<()> {
    HttpServer::new(|| {
        App::new()
            .route(ROUTE_PATH, web::get().to(get_entries))
            .route(ROUTE_PATH, web::post().to(save_entry))
    })
        .bind("127.0.0.1:8080")?
        .run()
        .await?;

    Ok(())
}