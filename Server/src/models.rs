use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[derive(PartialEq)]
#[derive(Debug)]
pub struct Category {
    pub key: i32,
    pub name: String,
    pub color: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[derive(PartialEq)]
#[derive(Debug)]
pub struct QA {
    pub key: i32,
    pub question: String,
    pub answer: String,
    pub category_id: i32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Backup {
    pub categories: Vec<Category>,
    pub qas: Vec<QA>,
    pub last_updated: Option<DateTime<Utc>>,
}

impl Default for Backup {
    fn default() -> Self {
        Self {
            categories: vec![],
            qas: vec![],
            last_updated: Some(Utc::now()),
        }
    }
}
