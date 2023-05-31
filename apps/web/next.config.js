const intercept = require('intercept-stdout');
const withTM = require('next-transpile-modules')(['@glyphx/types', 'react-data-grid']);
const path = require('path');
// safely ignore recoil stdout warning messages
// Detailed here : https://github.com/facebookexperimental/Recoil/issues/733
function interceptStdout(text) {
  if (text.includes('Duplicate atom key')) {
    return '';
  }
  return text;
}

// Intercept in dev and prod
intercept(interceptStdout);

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    maxPayloadSize: 1024 * 1024 * 1024,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV == 'production',
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
