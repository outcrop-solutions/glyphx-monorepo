= Dependencies =
wasm-pack : https://rustwasm.github.io/wasm-pack/installer/
http-server: https://www.npmjs.com/package/http-server


= Build =
For Web: wasm-pack build --target web 
This will place a wasm file in the pkg directory.  Then run `http-server . -p <your preferred port number>` to serve up the web page. 
The in your browser, navigate to the port you specified on localhost: `http://localhost:<your preferred port number>`
