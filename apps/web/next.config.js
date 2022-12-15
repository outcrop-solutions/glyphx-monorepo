const intercept = require('intercept-stdout');

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

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV == 'production', // TODO: Change to true
  },
  // webpack: (webpackConfig, { webpack }) => {
  //   webpackConfig.plugins.push(
  //     // Remove node: from import specifiers, because Next.js does not yet support node: scheme
  //     // https://github.com/vercel/next.js/issues/28774
  //     new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
  //       resource.request = resource.request.replace(/^node:/, '');
  //     })
  //   );

  //   return webpackConfig;
  // },
};
