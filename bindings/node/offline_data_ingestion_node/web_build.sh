#!/bin/bash
cargo build
cp ../../../target/debug/liboffline_data_ingestion.so offline_data_ingestion.node
cp offline_data_ingestion.node ../../../apps/web/pkg/offline_data_ingestion.node 
cp offline_data_ingestion.node ../../../packages/actions/pkg/offline_data_ingestion.node
