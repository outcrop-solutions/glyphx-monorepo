
use crate::types::athena_connection_errors::ConstructorError;

use glyphx_core::{
    aws::athena_manager::{AthenaManager, ConstructorError as AthenaManagerConstructorError, AthenaManagerConstructorOptionsBuilder},
    traits::IDatabase,
    SecretBoundError, SecretBoundSingleton,
};

use async_trait::async_trait;
use derive_builder::Builder;
use mockall::automock;

#[automock]
#[async_trait]
pub trait AthenaConnectionOps: std::fmt::Debug + Send + Sync {
    async fn build_athena_manager(
        &self,
        catalog: String,
        database: String,
    ) -> Result<Box<dyn IDatabase>, AthenaManagerConstructorError>;
}

#[derive(Builder)]
#[builder(pattern = "owned")]
pub struct AthenaConnectionConstructorOptions {
    #[builder(setter(into))]
    pub catalog_name: String,
    #[builder(setter(into))]
    pub database_name: String,
    #[builder(default = "Box::new(AthenaConnectionOpsImpl)")]
    pub dependencies: Box<dyn AthenaConnectionOps>,
}


#[derive(SecretBoundSingleton, Debug)]
#[secret_binder({"secret_name" : "db/athena", "initializer": "from_secret", "initializer_error": "ConstructorError"})]
pub struct AthenaConnection {
    #[bind_field({"secret_name" : "catalogName" })]
    catalog_name: String,
    #[bind_field({"secret_name": "databaseName" })]
    database_name: String,
    #[bind_field({"is_bound": false})]
    athena_manager: Box<dyn IDatabase>,
    #[bind_field({"is_bound": false})]
    dependencies: Box<dyn AthenaConnectionOps>,
}

#[derive(Debug, Clone)]
struct AthenaConnectionOpsImpl;

#[async_trait]
impl AthenaConnectionOps for AthenaConnectionOpsImpl {
    async fn build_athena_manager(
        &self,
         catalog: String,
         database: String ) -> Result<Box<dyn IDatabase>, AthenaManagerConstructorError> {
        let athena_manager_constructor_options = AthenaManagerConstructorOptionsBuilder::default().catalog(catalog).database(database).build().unwrap();
             let athena_manager = AthenaManager::new(athena_manager_constructor_options).await;
         if athena_manager.is_err() {
             return Err(athena_manager.err().unwrap());
         }
         Ok(Box::new(athena_manager.unwrap()))


    }
}

impl AthenaConnection {
    pub fn get_athena_manager(&self) -> &Box<dyn IDatabase> {
        
        &self.athena_manager
    }

    pub fn get_database_name(&self) -> &String {
        &self.database_name
    }

    pub fn get_data_catalog_name(&self) -> &String {
        &self.catalog_name
    }

    //Will return Err(AthenaManagerConstructorError) if something fails.  The T is
    //required to make the compiler happy, but it will always be AthenaManagerConstructorError
    //which is defined in the attribute on the struct.
    pub async fn new<T>(options: AthenaConnectionConstructorOptions) -> Result<Self, T>
    where
        T: SecretBoundError,
    {
        let dependecies = options.dependencies;
        let catalog_name = options.catalog_name.clone();
        let database_name = options.database_name.clone();
        let athena_manager = dependecies 
            .build_athena_manager(catalog_name.clone(), database_name.clone())
            .await;
        if athena_manager.is_err() {
            let err = athena_manager.err().unwrap();
            let variant = err.parse_error_type();
            let error_data = err.get_glyphx_error_data();
            let err = T::from_str(&variant, error_data.clone());

            err.error();
            return Err(err);
        }
        Ok(Self {
            catalog_name,
            database_name,
            athena_manager: athena_manager.unwrap(),
            dependencies: dependecies,
        })
    }

    pub async fn from_secret<T>(catalog_name: String, database_name: String) -> Result<Self, T>
    where
        T: SecretBoundError,
    {
        let options = AthenaConnectionConstructorOptionsBuilder::default()
            .catalog_name(catalog_name)
            .database_name(database_name)
            .build()
            .unwrap();
        Self::new(options).await
    }
}

impl Default for AthenaConnection {
    fn default() -> Self {
        Self {
            catalog_name: "".to_string(),
            database_name: "".to_string(),
            athena_manager: Box::new(AthenaManager::default()),
            dependencies: Box::new(AthenaConnectionOpsImpl),
        }
    }
}
#[cfg(test)]
mod contructor {
    use super::*;
    use glyphx_core::aws::athena_manager::ConstructorError as AthenaManagerConstructorError;
    use glyphx_core::GlyphxErrorData;
    #[tokio::test]
    async fn is_ok() {
        let catalog_name = "test_catalog".to_string();
        let database_name = "test_database".to_string();
        let clone_database_name = database_name.clone();
        let clone_catalog_name = catalog_name.clone();
        let mut mock_ops = MockAthenaConnectionOps::new();

        mock_ops
            .expect_build_athena_manager()
            .withf(move |arg1, arg2| arg1 == &clone_catalog_name && arg2 == &clone_database_name)
            .times(1)
            .returning(|_, _| Ok(Box::new(AthenaManager::default())));

        let options = AthenaConnectionConstructorOptionsBuilder::default()
            .catalog_name(catalog_name.clone())
            .database_name(database_name.clone())
            .dependencies(Box::new(mock_ops))
            .build()
            .unwrap();
        let athena_connection: Result<AthenaConnection, AthenaManagerConstructorError> =
            AthenaConnection::new(options)
                .await;
        assert!(athena_connection.is_ok());
        let athena_connection = athena_connection.unwrap();
        assert_eq!(&athena_connection.database_name, &database_name);
        assert_eq!(&athena_connection.catalog_name, &catalog_name);

        let struct_database_name = athena_connection.get_database_name();
        assert_eq!(struct_database_name, &database_name);
        let struct_catalog_name = athena_connection.get_data_catalog_name();
        assert_eq!(struct_catalog_name, &catalog_name);
        //Nothing to really assert here, just making sure that we can call the function.
        athena_connection.get_athena_manager();
    }

    #[tokio::test]
    async fn is_error() {
        let catalog_name = "test_catalog".to_string();
        let database_name = "test_database".to_string();
        let clone_database_name = database_name.clone();
        let clone_catalog_name = catalog_name.clone();
        let mut mock_ops = MockAthenaConnectionOps::new();

        mock_ops
            .expect_build_athena_manager()
            .withf(move |arg1, arg2| arg1 == &clone_catalog_name && arg2 == &clone_database_name)
            .times(1)
            .returning(|_, _| {
                Err(AthenaManagerConstructorError::DatabaseDoesNotExist(
                    GlyphxErrorData::default(),
                ))
            });

        let options = AthenaConnectionConstructorOptionsBuilder::default()
            .catalog_name(catalog_name.clone())
            .database_name(database_name.clone())
            .dependencies(Box::new(mock_ops))
            .build()
            .unwrap();
        let athena_connection: Result<AthenaConnection, AthenaManagerConstructorError> =
            AthenaConnection::new(options)
                .await;
        assert!(athena_connection.is_err());
        let athena_connection = athena_connection.err().unwrap();
        match athena_connection {
            AthenaManagerConstructorError::DatabaseDoesNotExist(_) => assert!(true),
            _ => assert!(false),
        }
    }
}
