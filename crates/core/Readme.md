##Useful testing commands.

### Run all unit and integration tests

```
cargo test
```

### Run only unit tests

```
cargo test --lib --features=test
```

### Run a specific unit test

```
cargo test --lib --features=test aws::s3_manager::list_objects::truncation

```

### Run all unit tests for a module or sub module

Notice the single quotes surrounding the test name(s) when using the wildcard

```
cargo test --lib  --features=test 'aws::s3_manager::list_objects::*'
```

### Run only integration tests

```
cargo test --features=test --test '*'
```

### List available integration tests crates

```
cargo test --features=test --test
```

### Run a specific integration test crate

in this example the aws crate which has integration tests for the aws and sub modules.

```
cargo test --features=test --test aws
```

### Run a specific integration test in a create

```
cargo test --features=test --test aws upload_stream::upload_a_file_from_string
```

### Run all tests for a sub module

Notice the single quotes around the test name when using the wildcard.

```
cargo test --features=test --test aws 'upload_stream::*'
```

By default, cargo test will swallow the output to stdout. To see the output you can add the `-- --nocapture` to the end of the command. For example:

```
cargo test --features=test --test aws 'upload_stream::*' -- --nocapture
```
