const intercept = require('intercept-stdout');

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
  typescript: {
    ignoreBuildErrors: true,
  },
  //https://nextjs.org/blog/next-13-1#built-in-module-transpilation-stable
  transpilePackages: ['core', 'business', 'database', 'email', 'fileingestion', 'glyphengine', 'types'],
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}',
      preventFullImport: true, // don't allow import of full lodash lib, when only using a few utilities
    },
  },
  experimental: {
    serverActions: true,
    // gives us statically types routes
    // typedRoutes: true,
    // turbo: {
    //   loaders: {
    //     '.svg': ['@svgr/webpack'],
    //   },
    // },
    // turbotrace: {
    // control the log level of the turbotrace, default is `error`
    // logLevel: 'error',
    // | 'bug'
    // | 'fatal'
    // | 'error'
    // | 'warning'
    // | 'hint'
    // | 'note'
    // | 'suggestions'
    // | 'info',
    // control if the log of turbotrace should contain the details of the analysis, default is `false`
    // logDetail?: boolean
    // show all log messages without limit
    // turbotrace only show 1 log message for each categories by default
    // logAll?: boolean
    // control the context directory of the turbotrace
    // files outside of the context directory will not be traced
    // set the `experimental.outputFileTracingRoot` has the same effect
    // if the `experimental.outputFileTracingRoot` and this option are both set, the `experimental.turbotrace.contextDirectory` will be used
    // contextDirectory?: string
    // if there is `process.cwd()` expression in your code, you can set this option to tell `turbotrace` the value of `process.cwd()` while tracing.
    // for example the require(process.cwd() + '/package.json') will be traced as require('/path/to/cwd/package.json')
    // processCwd?: string
    // control the maximum memory usage of the `turbotrace`, in `MB`, default is `6000`.
    // memoryLimit?: number
    //   },
  },
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    maxPayloadSize: 1024 * 1024 * 1024,
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },

  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // removes "X-POWERED-BY-VERCEL" header
  poweredByHeader: false,

  webpack(config, {buildId, dev, isServer, defaultLoaders, nextRuntime, webpack}) {
    if (!isServer) {
      // https://stackoverflow.com/questions/67478532/module-not-found-cant-resolve-fs-nextjs/67478653#67478653
      // config.resolve.fallback = {
      //   ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified by next.js will be dropped. Doesn't make much sense, but how it is
      //   os: false,
      //   fs: false,
      //   zlib: false,
      //   winston: false,
      //   querystring: false,
      //   crypto: false,
      // };
      // externalize server-only modules on the client
      // config.externals = ['winston', 'crypto', 'fs', 'zlib', 'querystring', '@colors/colors', ...config.externals];
    }

    // Grab the existing rule that handles SVG imports
    // @ts-ignore - this is a private property that is not typed
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: {not: [...fileLoaderRule.resourceQuery.not, /url/]}, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};
