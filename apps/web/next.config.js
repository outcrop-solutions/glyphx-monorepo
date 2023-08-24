const intercept = require('intercept-stdout');
const path = require('path');
// safely ignore recoil stdout warning messages
// Detailed here : https://github.com/facebookexperimental/Recoil/issues/733
function interceptStdout(text) {
  if (text.includes('Duplicate atom key')) {
    return '';
  } else if (text.includes('Critical dependency: the request of a dependency is an expression')) {
    return '';
  } else if (text.includes('Warning: Prop `style` did not match. Server:')) {
    return '';
  }
  return text;
}

// Intercept in dev and prod
intercept(interceptStdout);

/** @type {import('next').NextConfig} */
module.exports = {
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
};
