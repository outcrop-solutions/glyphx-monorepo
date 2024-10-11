#!/bin/bash
wasm-pack build --target web
cp ./pkg/g* ../../../apps/web/public/pkg
