#!/bin/bash
cargo build
cp ../../../target/debug/libglyph_engine_node.so index.node
cp index.node ../../../apps/web/pkg/index.node 
cp index.node ../../../packages/actions/pkg/index.node
