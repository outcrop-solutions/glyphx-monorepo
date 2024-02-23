use crate::aws::athena_stream_iterator::{
    ColumnInfo, ColumnNullable, Datum, GetQueryResultsError, GetQueryResultsOutput, ResultSet,
    ResultSetMetadata, Row, SdkError,
};
use rand::Rng;
use std::cell::RefCell;
use std::pin::Pin;
use std::task::{Context, Poll};

use tokio_stream::Stream;

pub struct MockStreamState {
    pub counter: usize,
    pub closure: RefCell<
        Option<
            Box<
                dyn FnMut(
                    &mut MockStream,
                )
                    -> Option<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>>,
            >,
        >,
    >,
    pub x_field_name: String,
    pub y_field_name: String,
    pub z_field_name: String,
    pub result_set_size: usize,
}

pub struct MockStream {
    // Fields to hold the internal state of your stream
    pub state: MockStreamState,
}

impl MockStream {
    pub fn new(
        x_field_name: &str,
        y_field_name: &str,
        z_field_name: &str,
        result_set_size: usize,
    ) -> Self {
        MockStream {
            state: MockStreamState {
                counter: 0,
                closure: RefCell::new(None),
                x_field_name: x_field_name.to_string(),
                y_field_name: y_field_name.to_string(),
                z_field_name: z_field_name.to_string(),
                result_set_size,
            },
        }
    }

    pub fn with_closure(
        &mut self,
        closure: Box<
            dyn FnMut(
                &mut MockStream,
            )
                -> Option<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>>,
        >,
    ) {
        self.state.closure.replace(Some(closure));
    }

    fn get_result_set_metadata(&self) -> ResultSetMetadata {
        let column1 = ColumnInfo::builder()
            .name("glyphx_id__")
            .r#type("string")
            .nullable(ColumnNullable::NotNull)
            .build();
        let column2 = ColumnInfo::builder()
            .name(&self.state.x_field_name)
            .r#type("string")
            .nullable(ColumnNullable::NotNull)
            .build();
        let column3 = ColumnInfo::builder()
            .name(&self.state.y_field_name)
            .r#type("string")
            .nullable(ColumnNullable::NotNull)
            .build();
        let column4 = ColumnInfo::builder()
            .name(&self.state.z_field_name)
            .r#type("string")
            .nullable(ColumnNullable::NotNull)
            .build();
        ResultSetMetadata::builder()
            .column_info(column1)
            .column_info(column2)
            .column_info(column3)
            .column_info(column4)
            .build()
    }
    fn get_row_data(&self, row_number: usize, is_multiple_row_ids: Option<()>) -> Row {
        let count = (self.state.counter * 30) + ((row_number * 3) + 1);
        let col1 = if is_multiple_row_ids.is_some() {
            format!("{}|{}", count, count * 100 + count)
        } else {
            format!("{}", count)
        };
        let col2 = format!("{}", count);
        let col3 = format!("{}", count + 1);
        let col4 = format!("{}", count + 2);
        Row::builder()
            .data(Datum::builder().var_char_value(col1).build())
            .data(Datum::builder().var_char_value(col2).build())
            .data(Datum::builder().var_char_value(col3).build())
            .data(Datum::builder().var_char_value(col4).build())
            .build()
    }
    fn get_header_row(&self) -> Row {
        let col1 = "glyphx_id__";
        let col2 = &self.state.x_field_name;
        let col3 = &self.state.y_field_name;
        let col4 = &self.state.z_field_name;
        Row::builder()
            .data(Datum::builder().var_char_value(col1.to_string()).build())
            .data(Datum::builder().var_char_value(col2.to_string()).build())
            .data(Datum::builder().var_char_value(col3.to_string()).build())
            .data(Datum::builder().var_char_value(col4.to_string()).build())
            .build()
    }
    pub fn get_query_results_set(&self, is_empty: Option<()>) -> GetQueryResultsOutput {
        let mut rng = rand::thread_rng();
        let rand_index = rng.gen_range(1..self.state.result_set_size) - 1;
        let metadata = self.get_result_set_metadata();
        let mut result_set = ResultSet::builder().result_set_metadata(metadata);
        if is_empty.is_none() {
            if self.state.counter == 0 {
                result_set = result_set.rows(self.get_header_row());
            }
            for i in 0..self.state.result_set_size {
                let row = self.get_row_data(i, if i == rand_index { Some(()) } else { None });
                result_set = result_set.rows(row);
            }
        } else {
            result_set = result_set.set_rows(Some(Vec::new()));
        }
        let result_set = result_set.build();
        GetQueryResultsOutput::builder()
            .result_set(result_set)
            .build()
    }
}

impl Stream for MockStream {
    type Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let closure = self.state.closure.borrow_mut().take();
        if closure.is_none() {
            return Poll::Ready(Some(Ok(self.get_query_results_set(Some(())))));
        }
        let mut closure = closure.unwrap();
        let mut_self = self.get_mut();
        let result = closure(mut_self);
        mut_self.state.closure.replace(Some(closure));
        mut_self.state.counter += 1;
        Poll::Ready(result)
    }
}
