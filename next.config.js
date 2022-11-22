const intercept = require("intercept-stdout");

// safely ignore recoil stdout warning messages 
// Detailed here : https://github.com/facebookexperimental/Recoil/issues/733
function interceptStdout(text) {
  if (text.includes("Duplicate atom key")) {
    return "";
  }
  return text;
}

// Intercept in dev and prod
intercept(interceptStdout);

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: true, // TODO: Change to true 
  },
};
