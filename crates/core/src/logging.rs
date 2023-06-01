//!This module contains the functions required to configure logging.
//!Logging is standard across all GlyphX applications.  This module,
//!will ensure that each application logs its information appropriately.
use crate::error::InvalidOperationError;
use log::LevelFilter;
use log4rs::append::console::ConsoleAppender;
use log4rs::append::rolling_file::policy::compound::roll::fixed_window::FixedWindowRoller;
use log4rs::append::rolling_file::policy::compound::trigger::size::SizeTrigger;
use log4rs::append::rolling_file::policy::compound::CompoundPolicy;
use log4rs::append::rolling_file::RollingFileAppender;
use log4rs::config::{Appender, Config, Root};
use log4rs::Handle;
use serde_json::json;

///The setup logging function is used to configure the logging.  An application 
///should call this function once and only once.
/// # Arguments
/// * `application_name` - The name of the application.  This will be used to 
/// report any errors in the logging configuration. In the future it may be used
/// better identify the source of the log messages.
/// * `file_name` - The name of the file to log to.  If this is not provided
/// then the default file name of output.log will be used.
/// * `file_size` - The maximum size of the log file.  If this is not provided
/// then the default size of 1,000,000 bytes will be used.
/// * `level_filter` - The level of logging that should be used.  If this is not
/// provided then the default level of info will be used.
pub fn setup_logging(
    application_name: String,
    file_name: Option<String>,
    file_size: Option<u32>,
    level_filter: Option<LevelFilter>,
) {
    configure_logging(
        application_name,
        file_name,
        file_size,
        level_filter,
        |config| log4rs::init_config(config),
    );
}

///This is the internal implementation of the setup_logging function.
///We are using dependency injection to allow us to test the logging
///configuration.
fn configure_logging<T>(
    application_name: String,
    file_name: Option<String>,
    file_size: Option<u32>,
    level_filter: Option<LevelFilter>,
    config_fn: T,
) where
    T: FnOnce(Config) -> Result<Handle, log::SetLoggerError>,
{
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

    config_fn(config).unwrap_or_else(|err| {
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
    use json5;
    use log;
    use serial_test::serial;
    use std::panic;
    use crate::utility_functions::json_functions::clean_json_string;

    fn get_mock_init(
        application_name: String,
        file_name: String,
        file_size: u32,
        level_filter: LevelFilter,
        force_init: bool,
    ) -> Box<dyn FnOnce(Config) -> Result<Handle, log::SetLoggerError>> {
        let retval = move |config: log4rs::config::runtime::Config| {
            //We expect to appenders, the console and the file
            assert_eq!(config.appenders().len(), 2);

            //assert our console appender is correct
            let console_appender = config.appenders().get(0).unwrap();
            assert!(console_appender.name().eq("console"));
            let console_appender = format!("{:?}", console_appender.appender());
            assert!(console_appender.starts_with("ConsoleAppender"));

            let file_appender = config.appenders().get(1).unwrap();
            let file_appender = format!("{:?}", file_appender.appender());
            assert!(file_appender.starts_with("RollingFileAppender"));
            //Remove the RollingFileAppender from the string
            let idx = file_appender.find('{').unwrap();
            let file_appender = &file_appender[idx..];
            //Cleanup the string so we can parse it as json
            let file_appender = file_appender
                .replace("PatternEncoder", "")
                .replace("CompoundPolicy", "")
                .replace("SizeTrigger", "")
                .replace("FixedWindowRoller", "")
                .replace(": None,", ": \"None\",");
            let file_appender =
                json5::from_str::<serde_json::Value>(file_appender.as_str()).unwrap();
            let path = file_appender.get("path").unwrap().as_str().unwrap();
            assert_eq!(path, file_name);

            let policy = file_appender.get("policy").unwrap();
            let trigger = policy.get("trigger").unwrap();
            let limit = trigger.get("limit").unwrap().as_u64().unwrap();
            assert_eq!(limit, file_size as u64);

            let roller = policy.get("roller").unwrap();
            let count = roller.get("count").unwrap().as_u64().unwrap();
            assert_eq!(count, 24);

            assert_eq!(config.root().level(), level_filter);
            //We are creating an empty config so that any calls to the log crate
            //will not create any artifacts.
            let config = Config::builder()
                .build(Root::builder().build(level_filter))
                .unwrap();

            if !force_init {
                if let Some(handle) = unsafe { HANDLE.as_ref() } {
                    handle.set_config(config);
                } else {
                    unsafe { HANDLE = Some(log4rs::init_config(config)?) }
                }
            } else {

                    unsafe { HANDLE = Some(log4rs::init_config(config)?) }
            }
            let copy = unsafe { HANDLE.as_ref().unwrap().clone() };
            Ok(copy)
        };

        Box::new(retval)
    }
    static mut HANDLE: Option<Handle> = None;

    #[test]
    #[serial]
    fn setup_logging_with_defaults() {
        let mock_init = get_mock_init(
            String::from("test"),
            String::from("output.log"),
            1_000_000,
            LevelFilter::Info,
            false
        );
        //all of our asserts are run as part of the mock init function
        configure_logging(String::from("test"), None, None, None, mock_init);
        assert!(log::log_enabled!(log::Level::Info));
    }

    #[test]
    #[serial]
    fn setup_logging_with_passed_values() {
        let output_file_name = String::from("Foo.bar");
        let file_size = 63_000_000;
        let level_filter = LevelFilter::Debug;
        let mock_init = get_mock_init(
            String::from("test"),
            output_file_name.clone(),
            file_size,
            level_filter,
            false
        );
        //all of our asserts are run as part of the mock init function
        configure_logging(
            String::from("test"),
            Some(output_file_name),
            Some(file_size),
            Some(level_filter),
            mock_init,
        );

        assert!(log::log_enabled!(log::Level::Debug));
    }

    #[test]
    #[serial]
    fn setup_logging_panics_on_consecutive_calls() {
        let application_name = String::from("test");
        let output_file_name = String::from("Foo.bar");
        let file_size = 63_000_000;
        let level_filter = LevelFilter::Debug;

        //If we have not run any logging tests, then we need to run
        //this setup first to stage the initial logging configuration
        if unsafe {HANDLE.is_none()} {
            let mock_init = get_mock_init(
                application_name.clone(),
                output_file_name.clone(),
                file_size,
                level_filter,
                false
            );
            configure_logging(
                application_name.clone(),
                Some(output_file_name.clone()),
                Some(file_size),
                Some(level_filter),
                mock_init,
            );
        }
        //now this should panic
        let result = panic::catch_unwind(|| {
            setup_logging(
                application_name.clone(),
                Some(output_file_name.clone()),
                Some(file_size),
                Some(level_filter),
            );
        });

        assert!(result.is_err());

        let error = result.unwrap_err();
        let error = error.downcast_ref::<String>().unwrap();
        let error = clean_json_string(String::from(error));
        let json_value = serde_json::from_str::<serde_json::Value>(error.as_str()).unwrap();
        let name = json_value.get("name").unwrap().as_str().unwrap();
        assert_eq!(name,"Invalid Operation Error");
        let inner_error = json_value.get("inner_error");
        assert!(inner_error.is_some());
        let data = json_value.get("data").unwrap();
        let app_name = data.get("application_name").unwrap().as_str().unwrap();
        assert_eq!( app_name,application_name);

    }
}
