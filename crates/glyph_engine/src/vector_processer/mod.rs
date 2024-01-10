use crate::types::vectorizer_parameters::FieldDefinition;
use im::OrdMap;
use std::sync::mpsc::{channel, Receiver, Sender, TryRecvError};
use tokio::task::{spawn, JoinHandle};
use std::cmp::{Eq, PartialEq, Ord, PartialOrd};
#[derive(Debug, Clone)]
pub struct Vector<T>
where
    T: Send + Clone + std::fmt::Debug + Default + Eq + PartialEq + Ord + PartialOrd
{
    pub orig_value: T,
    pub vector: i64,
    pub rank: u64,
    pub is_empty: Option<()>,
}

impl<T> Vector<T>
where
    T: Send + Clone + std::fmt::Debug + Default + Eq + PartialEq + Ord + PartialOrd
{
    pub fn new(orig_value: T, vector: i64, rank: u64) -> Self {
        Self {
            orig_value,
            vector,
            rank,
            is_empty: None,
        }
    }

    fn empty() -> Self {
        Self {
            orig_value: T::default(),
            vector: 0,
            rank: 0,
            is_empty: Some(()),
        }
    }
}

#[derive(Debug, Clone)]
enum TaskStatus {
    Pending,
    Processing,
    Complete,
    Errored,
}

pub struct VectorProcesser<T>
where
    T: Send + Clone + std::fmt::Debug + Default + Eq + PartialEq + Ord + PartialOrd
{
    axis_name: String,
    field_definition: FieldDefinition,
    receiver: Receiver<Vector<T>>,
    sender: Sender<Vector<T>>,
    vectors: OrdMap<T, Vector<T>>,
    join_handle: Option<JoinHandle<()>>,
    task_status: TaskStatus,
}

impl<T> VectorProcesser<T>
where
    T: Send + Clone + std::fmt::Debug + Default + Eq + PartialEq + Ord + PartialOrd
{
    pub fn new(axis_name: &str, field_definition: FieldDefinition) -> Self {
        let (sender, receiver) = channel();
        Self {
            axis_name: axis_name.to_string(),
            field_definition,
            receiver,
            sender,
            vectors: OrdMap::new(),
            join_handle: None,
            task_status: TaskStatus::Pending,
        }
    }

    pub fn start(&self) -> Result<(), ()> {
        let field_definition = self.field_definition.clone();
        let thread_handle = spawn( async move {
            let field_name = field_definition.  field_name.clone();
            let table_name = field_definition.table_name.clone();
            let query = format!("SELECT DISTINCT {} FROM {} ORDER BY {}",
                field_name,
                table_name,
                field_name
            );
        });
        Ok(())

    }

    pub fn check_status(&mut self) -> TaskStatus {
        loop {
            let result = self.receiver.try_recv();
            if result.is_err() {
                match result.err().unwrap() {
                    TryRecvError::Empty => {
                        return self.task_status.clone();
                    }
                    TryRecvError::Disconnected => {
                        self.task_status = TaskStatus::Errored;
                        return self.task_status.clone();
                    }
                }
            }
            let result = result.unwrap();
            if result.is_empty.is_some() {
                self.task_status = TaskStatus::Complete;
                return self.task_status.clone();
            } else {
                self.vectors.insert(result.orig_value.clone(), result);
            }
        }
    }

    pub fn get_vector(&self, key: &T) -> Option<&Vector<T>> {
        self.vectors.get(key)
    }
}
