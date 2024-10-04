#!/bin/bash
wasm-pack build --debug --target web
cp ./pkg/g* ../../../apps/web/public/pkg
