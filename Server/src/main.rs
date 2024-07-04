mod models;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::{fs, io::Result};
use chrono::{Local, DateTime, Utc};

use const_format::formatcp;
use http::header::{HeaderValue};
use http::header::LINK;
use actix_cors::Cors;
use crate::models::Backup;

const SERVER_ADDRESS: &str = "127.0.0.1:8081";
const SERVER_BASE_URL: &str = formatcp!("http://{}", SERVER_ADDRESS);
const BACKUP_DIR: &str = "./backup";
const BACKUP_FILE_NAME: &str = "latest.json";
 const BACKUP_FILE_PATH: &str = formatcp!("{}/{}", BACKUP_DIR, BACKUP_FILE_NAME);
const ROUTE_PATH: &str = "/entries";

fn build_link_header_value(rel: &str) -> String {
    format!("<{}{}> rel=\"{}\"", SERVER_BASE_URL, ROUTE_PATH, rel)
}

async fn get_dispatcher() -> impl Responder {
    HttpResponse::Ok()
        .append_header(("Link", build_link_header_value("get-entries")))
        .append_header(("Link", build_link_header_value("post-entries")))
        .body("")
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
async fn post_entries(entry: web::Json<Backup>) -> impl Responder {
    let now = Utc::now(); // Current UTC time

    // convert web::Json<Backup> into Backup
    let mut new_backup = entry.into_inner();
    new_backup.last_updated = Some(now); // Update the timestamp

    // serialize and save the updated backup
    match fs::write(BACKUP_FILE_PATH, serde_json::to_string(&new_backup).unwrap()) {
        Ok(_) => HttpResponse::Created().body(format!("Backup saved at {}", now)),
        Err(_) => HttpResponse::InternalServerError().body("Error saving backup"),
    }
}

fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg
        .route("/", web::get().to(get_dispatcher))
        .route(ROUTE_PATH, web::get().to(get_entries))
        .route(ROUTE_PATH, web::post().to(post_entries));
}

#[actix_rt::main]
async fn main() -> Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .configure(config_routes)
    })
        .bind("127.0.0.1:8081")?
        .run()
        .await?;

    Ok(())
}