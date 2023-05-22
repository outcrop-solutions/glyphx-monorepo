use crate::error::InvalidOperationError;
use log::{info, LevelFilter};
use log4rs::append::console::ConsoleAppender;
use log4rs::append::rolling_file::policy::compound::roll::fixed_window::FixedWindowRoller;
use log4rs::append::rolling_file::policy::compound::trigger::size::SizeTrigger;
use log4rs::append::rolling_file::policy::compound::CompoundPolicy;
use log4rs::append::rolling_file::RollingFileAppender;
use log4rs::config::{Appender, Config, Root};
use serde_json::json;

pub struct Logger {
    application_name: String,
    file_name: Option<String>,
    file_size: Option<u32>,
    level_filter: Option<LevelFilter>,
}

fn setup_logging(
    application_name: String,
    file_name: Option<String>,
    file_size: Option<u32>,
    level_filter: Option<LevelFilter>,
) {
    let file_name = file_name.as_deref().unwrap_or("output.log");
    let file_size = file_size.unwrap_or(1_000_000);
    let level_filter = level_filter.unwrap_or(LevelFilter::Info);

    // Define the console appender
    let console_appender = ConsoleAppender::builder().build();
    let archived_log_name = format!("{}.{{}}.arch", file_name);
    // Define the file appender with rotation
    let file_appender = RollingFileAppender::builder()
        .build(
            file_name,
            Box::new(CompoundPolicy::new(
                Box::new(SizeTrigger::new(file_size as u64)),
                Box::new(
                    FixedWindowRoller::builder()
                        .base(0)
                        .build(&archived_log_name, 24)
                        .unwrap(),
                ),
            )),
        )
        .unwrap_or_else(|err| {
            let error = InvalidOperationError::new(
                &format!(
                    "Failed to create rolling file appender for the app {}, using the file name : {}, with a file size of {}",
                    application_name, file_name, file_size
                ),
                Some(json!(
                    {
                        "application_name": application_name,
                        "file_name": file_name,
                        "file_size": file_size,
                    }

                )),
                Some(&err),
            );
            //We panic here because this is a configuration error
            //which could have downstream effects.
            panic!("{}", error);
        });

    // Configure the root logger to use both appenders
    let config = Config::builder()
        .appender(Appender::builder().build("console", Box::new(console_appender)))
        .appender(Appender::builder().build("file", Box::new(file_appender)))
        .build(
            Root::builder()
                .appender("console")
                .appender("file")
                .build(level_filter),
        )
        .unwrap();

    log4rs::init_config(config).unwrap_or_else(|err| {
        let error = InvalidOperationError::new(
            &format!(
                "Failed to initialize the log4rs configuration for the app {}",
                application_name
            ),
            Some(json!(
                {
                    "application_name": application_name,
                }

            )),
            Some(&err),
        );
        //We panic here because this is a configuration error
        //which could have downstream effects.
        panic!("{}", error);
    });
}

#[cfg(test)]
mod logging_tests {
    use super::*;
    use crate::error::GlyphxError;
    #[test]
    fn setup_logging_with_defaults() {
        setup_logging(String::from("test"), None, None, None);
        info!("This is a test");
        let inner_inner_error = String::from("I am the inner inner error");
        let ierr = InvalidOperationError::new(
            &String::from("This is an inner test error"),
            Some(json!(
                {
                    "application_name": "test",
                    "foo": "bar"
                }

            )),
            Some(&inner_inner_error),
        );
        let err = InvalidOperationError::new(
            &String::from("This is a test error"),
            Some(json!(
                {
                    "application_name": "test",
                }

            )),
            Some(&ierr),
        );
        info!("{}", err.publish());
    }
}
