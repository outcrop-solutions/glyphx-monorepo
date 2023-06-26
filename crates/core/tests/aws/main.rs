mod athena_manager;
mod s3_manager;
mod upload_stream;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};

pub fn generate_random_file_name(length: usize) -> String {
    let rng = thread_rng();
    let file_name: String = rng
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect();
    file_name
}
