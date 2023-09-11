   const config = {
     parallelism: undefined,
     externals: [ 'next' ],
     optimization: {
       emitOnErrors: false,
       checkWasmTypes: false,
       nodeEnv: false,
       splitChunks: false,
       runtimeChunk: { name: 'webpack' },
       minimize: false,
       minimizer: [ [Function (anonymous)], [Function (anonymous)] ],
       usedExports: false
     },
     context: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
     entry: [AsyncFunction: entry],
     watchOptions: {
       aggregateTimeout: 5,
       ignored: /^((?:[^/]*(?:\/|$))*)(\.(git|next)|node_modules)(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/
     },
     output: {
       publicPath: '/_next/',
       path: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next',
       filename: 'static/chunks/[name].js',
       library: '_N_E',
       libraryTarget: 'assign',
       hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
       hotUpdateMainFilename: 'static/webpack/[fullhash].[runtime].hot-update.json',
       chunkFilename: 'static/chunks/[name].js',
       strictModuleExceptionHandling: true,
       crossOriginLoading: undefined,
       webassemblyModuleFilename: 'static/wasm/[modulehash].wasm',
       hashFunction: 'xxhash64',
       hashDigestLength: 16,
       trustedTypes: 'nextjs#bundler',
       enabledLibraryTypes: [ 'assign' ]
     },
     performance: false,
     resolve: {
       extensions: [
         '.mjs',  '.js',
         '.tsx',  '.ts',
         '.jsx',  '.json',
         '.wasm'
       ],
       extensionAlias: undefined,
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src'
       ],
       alias: {
         '@vercel/og': 'next/dist/server/web/spec-extension/image-response',
         '@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
         next: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next',
         'styled-jsx/style$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/style.js',
         'styled-jsx$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/index.js',
         'private-next-pages/_app': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.js',
           'next/dist/pages/_app.js'
         ],
         'private-next-pages/_error': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.js',
           'next/dist/pages/_error.js'
         ],
         'private-next-pages/_document': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.js',
           'next/dist/pages/_document.js'
         ],
         'private-next-pages': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         'private-next-app-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         'private-next-root-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
         'private-dot-next': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next',
         'unfetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/index.js',
         'isomorphic-unfetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/index.js',
         'whatwg-fetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/whatwg-fetch.js',
         'object-assign$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object-assign.js',
         'object.assign/auto': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/auto.js',
         'object.assign/implementation': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/implementation.js',
         'object.assign$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/index.js',
         'object.assign/polyfill': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/polyfill.js',
         'object.assign/shim': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/shim.js',
         url: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/native-url/index.js',
         'private-next-rsc-action-validate': 'next/dist/build/webpack/loaders/next-flight-loader/action-validate',
         'private-next-rsc-action-client-wrapper': 'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
         'private-next-rsc-action-proxy': 'next/dist/build/webpack/loaders/next-flight-loader/action-proxy',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/router/utils/resolve-rewrites.js': false,
         '@swc/helpers/_': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/@swc+helpers@0.5.1/node_modules/@swc/helpers/_',
         setimmediate: 'next/dist/compiled/setimmediate'
       },
       fallback: {
         process: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/process.js',
         os: false,
         fs: false
       },
       mainFields: [ 'browser', 'module', 'main' ],
       plugins: [
         JsConfigPathsPlugin {
           paths: {
             '@/email/*': [ 'src/email/*' ],
             '@/app/*': [ 'src/app/*' ],
             '@/config/*': [ 'src/config/*' ],
             '@/layouts/*': [ 'src/layouts/*' ],
             '@/public/*': [ 'src/public/*' ],
             '@/lib/*': [ 'src/lib/*' ],
             '@/lib/server': [ 'src/business/server/*' ],
             '@/lib/client': [ 'src/lib/client/*' ],
             '@/pages/*': [ 'src/pages/*' ],
             '@/hooks/*': [ 'src/hooks/*' ],
             '@/providers/*': [ 'src/providers/*' ],
             '@/state/*': [ 'src/state/*' ],
             '@/services/*': [ 'src/services/*' ],
             '@/styles/*': [ 'src/styles/*' ],
             '@/utils/*': [ 'src/utils/*' ]
           },
           resolvedBaseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
           jsConfigPlugin: true
         }
       ]
     },
     resolveLoader: {
       alias: {
         'error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/error-loader',
         'next-swc-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-swc-loader',
         'next-client-pages-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-client-pages-loader',
         'next-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-image-loader',
         'next-metadata-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader',
         'next-style-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-style-loader',
         'next-flight-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-loader',
         'next-flight-client-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader',
         'next-flight-action-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-action-entry-loader',
         'next-flight-client-module-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-module-loader',
         'noop-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/noop-loader',
         'next-middleware-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-loader',
         'next-edge-function-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-function-loader',
         'next-edge-app-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-app-route-loader',
         'next-edge-ssr-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-ssr-loader',
         'next-middleware-asset-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-asset-loader',
         'next-middleware-wasm-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-wasm-loader',
         'next-app-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-app-loader',
         'next-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-route-loader',
         'next-font-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-font-loader',
         'next-invalid-import-error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-invalid-import-error-loader',
         'next-metadata-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-route-loader',
         'modularize-import-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/modularize-import-loader'
       },
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules'
       ],
       plugins: []
     },
     module: {
       rules: [
         {
           layer: 'shared',
           test: /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
         },
         {
           resourceQuery: /__next_metadata_route__/,
           layer: 'app-metadata-route'
         },
         {
           layer: 'ssr',
           test: /next[\\/]dist[\\/](esm[\\/])?server[\\/]future[\\/]route-modules[\\/]app-page[\\/]module/
         },
         {
           issuerLayer: {
             or: [
               'rsc',
               'ssr',
               'app-pages-browser',
               'actionBrowser',
               'shared'
             ]
           },
           resolve: {
             alias: {
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/head.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/components/noop-head.js',
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dynamic.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/app-dynamic.js',
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node'
             }
           }
         },
         { test: /\.m?js/, resolve: { fullySpecified: false } },
         {
           oneOf: [
             {
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               test: {
                 and: [
                   /\.(tsx|ts|js|cjs|mjs|jsx)$/,
                   {
                     not: [
                       /[/\\]node_modules[/\\](@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@jpg-store[/\\]lucid-cardano|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@prisma[/\\]client|@sentry[/\\]nextjs|@sentry[/\\]node|@swc[/\\]core|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|cpu-features|cypress|eslint|express|firebase-admin|jest|jsdom|lodash|mdx-bundler|mongodb|mongoose|next-mdx-remote|next-seo|payload|pg|playwright|postcss|prettier|prisma|puppeteer|rimraf|sharp|shiki|sqlite3|tailwindcss|ts-node|typescript|vscode-oniguruma|webpack)[/\\]/
                     ]
                   }
                 ]
               },
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react/react.shared-subset',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/empty',
                   'client-only$': 'next/dist/compiled/client-only/error'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'ssr',
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/index',
                   'client-only$': 'next/dist/compiled/client-only/index'
                 }
               }
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/google/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: false,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/local/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: false,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]google[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: false,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]local[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: false,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               test: /\.(css|scss|sass)$/,
               issuer: /pages[\\/]_document\./,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move global styles to \x1B[36mpages/_app.js\x1B[39m.'
                 }
               }
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: false,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               test: [ /\.module\.css$/, /\.module\.(scss|sass)$/ ],
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS Modules \x1B[1mcannot\x1B[22m be imported from within \x1B[1mnode_modules\x1B[22m.\n' +
                     'Read more: https://nextjs.org/docs/messages/css-modules-npm'
                 }
               }
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.css$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.(scss|sass)$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/mini-css-extract-plugin/loader.js',
                   options: { publicPath: '/_next/', esModule: false }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.css$/,
               include: undefined,
               issuer: undefined,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.(scss|sass)$/,
               include: undefined,
               issuer: undefined,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.css$/,
               issuer: {
                 and: [
                   /\/Users\/jamesmurdockgraham\/Desktop\/projects\/glyphx\/dev\/monorepo\/apps\/web\/src\/pages\/_app/
                 ]
               },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: true,
               test: /(?<!\.module)\.(scss|sass)$/,
               issuer: {
                 and: [
                   /\/Users\/jamesmurdockgraham\/Desktop\/projects\/glyphx\/dev\/monorepo\/apps\/web\/src\/pages\/_app/
                 ]
               },
               use: [
                 {
                   loader: 'next-style-loader',
                   options: { insert: [Function: insert] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     modules: false,
                     url: [Function: url],
                     import: [Function: import]
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               issuer: {
                 and: [
                   '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web'
                 ],
                 not: [ /layout\.(js|mjs|jsx|ts|tsx)$/ ]
               },
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Global CSS \x1B[1mcannot\x1B[22m be imported from files other than your \x1B[1mCustom <App>\x1B[22m. Due to the Global nature of stylesheets, and to avoid conflicts, Please move all first-party global CSS imports to \x1B[36mpages/_app.js\x1B[39m. Or convert the import to Component-Level CSS (CSS Modules).\n' +
                     'Read more: https://nextjs.org/docs/messages/css-global'
                 }
               }
             },
             {
               issuer: /\.(css|scss|sass)$/,
               exclude: [
                 /\.(js|mjs|jsx|ts|tsx)$/,
                 /\.html$/,
                 /\.json$/,
                 /\.webpack\[[^\]]+\]$/
               ],
               type: 'asset/resource'
             },
             {
               test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Images \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move image imports that need to be displayed on every page into \x1B[36mpages/_app.js\x1B[39m.\n' +
                     'Read more: https://nextjs.org/docs/messages/custom-document-image-import'
                 }
               },
               issuer: /pages[\\/]_document\./
             }
           ]
         },
         {
           test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
           issuerLayer: 'app-pages-browser',
           resolve: {
             alias: {
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
               'server-only$': 'next/dist/compiled/server-only/index',
               'client-only$': 'next/dist/compiled/client-only/index'
             }
           }
         },
         {
           oneOf: [
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               issuerLayer: 'api',
               parser: { url: true },
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: false,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: true,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'middleware',
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: false,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: true,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: false,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: true,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               resourceQuery: /__next_edge_ssr_entry__/,
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: false,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: true,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/,
                 [Function: exclude]
               ],
               issuerLayer: { or: [ 'ssr', 'app-pages-browser' ] },
               use: [
                 '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/react-refresh-utils/dist/loader.js',
                 { loader: 'next-flight-client-module-loader' },
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: false,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: true,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: false
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               use: [
                 '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/react-refresh-utils/dist/loader.js',
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: false,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: true,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                   }
                 }
               ]
             }
           ]
         },
         {
           test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
           loader: 'next-image-loader',
           issuer: { not: /\.(css|scss|sass)$/ },
           dependency: { not: [ 'url' ] },
           resourceQuery: {
             not: [
               /__next_metadata__/,
               /__next_metadata_route__/,
               /__next_metadata_image_meta__/
             ]
           },
           options: {
             isDev: true,
             compilerType: 'client',
             basePath: '',
             assetPrefix: ''
           }
         },
         {
           resolve: {
             fallback: {
               assert: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/assert/assert.js',
               buffer: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/buffer/index.js',
               constants: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/constants-browserify/constants.json',
               crypto: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/crypto-browserify/index.js',
               domain: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/domain-browser/index.js',
               http: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/stream-http/index.js',
               https: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/https-browserify/index.js',
               os: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/os-browserify/browser.js',
               path: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/path-browserify/index.js',
               punycode: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/punycode/punycode.js',
               process: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/process.js',
               querystring: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/querystring-es3/index.js',
               stream: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/stream-browserify/index.js',
               string_decoder: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/string_decoder/string_decoder.js',
               sys: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/util/util.js',
               timers: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/timers-browserify/main.js',
               tty: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/tty-browserify/index.js',
               util: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/util/util.js',
               vm: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/vm-browserify/index.js',
               zlib: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/browserify-zlib/index.js',
               events: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/events/events.js',
               setImmediate: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/setimmediate/setImmediate.js'
             }
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]client-only[/\\]error.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
           options: {
             message: "'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component."
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]server-only[/\\]index.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: 'ssr',
           options: {
             message: "'server-only' cannot be imported from a Client Component module. It should only be used from a Server Component."
           }
         },
         {
           test: /[\\/]next[\\/]dist[\\/](esm[\\/])?server[\\/]web[\\/]exports[\\/]image-response\.js/,
           sideEffects: false
         },
         { test: /\.svg$/, use: [ '@svgr/webpack' ] }
       ],
       parser: { javascript: { url: 'relative' } },
       generator: { asset: { filename: 'static/media/[name].[hash:8][ext]' } },
       unsafeCache: [Function (anonymous)]
     },
     plugins: [
       ReactFreshWebpackPlugin {
         webpackMajorVersion: 5,
         RuntimeGlobals: {
           require: '__webpack_require__',
           requireScope: '__webpack_require__.*',
           exports: '__webpack_exports__',
           thisAsExports: 'top-level-this-exports',
           returnExportsFromRuntime: 'return-exports-from-runtime',
           module: 'module',
           moduleId: 'module.id',
           moduleLoaded: 'module.loaded',
           publicPath: '__webpack_require__.p',
           entryModuleId: '__webpack_require__.s',
           moduleCache: '__webpack_require__.c',
           moduleFactories: '__webpack_require__.m',
           moduleFactoriesAddOnly: '__webpack_require__.m (add only)',
           ensureChunk: '__webpack_require__.e',
           ensureChunkHandlers: '__webpack_require__.f',
           ensureChunkIncludeEntries: '__webpack_require__.f (include entries)',
           prefetchChunk: '__webpack_require__.E',
           prefetchChunkHandlers: '__webpack_require__.F',
           preloadChunk: '__webpack_require__.G',
           preloadChunkHandlers: '__webpack_require__.H',
           definePropertyGetters: '__webpack_require__.d',
           makeNamespaceObject: '__webpack_require__.r',
           createFakeNamespaceObject: '__webpack_require__.t',
           compatGetDefaultExport: '__webpack_require__.n',
           harmonyModuleDecorator: '__webpack_require__.hmd',
           nodeModuleDecorator: '__webpack_require__.nmd',
           getFullHash: '__webpack_require__.h',
           wasmInstances: '__webpack_require__.w',
           instantiateWasm: '__webpack_require__.v',
           uncaughtErrorHandler: '__webpack_require__.oe',
           scriptNonce: '__webpack_require__.nc',
           loadScript: '__webpack_require__.l',
           createScript: '__webpack_require__.ts',
           createScriptUrl: '__webpack_require__.tu',
           getTrustedTypesPolicy: '__webpack_require__.tt',
           chunkName: '__webpack_require__.cn',
           runtimeId: '__webpack_require__.j',
           getChunkScriptFilename: '__webpack_require__.u',
           getChunkCssFilename: '__webpack_require__.k',
           hasCssModules: 'has css modules',
           getChunkUpdateScriptFilename: '__webpack_require__.hu',
           getChunkUpdateCssFilename: '__webpack_require__.hk',
           startup: '__webpack_require__.x',
           startupNoDefault: '__webpack_require__.x (no default handler)',
           startupOnlyAfter: '__webpack_require__.x (only after)',
           startupOnlyBefore: '__webpack_require__.x (only before)',
           chunkCallback: 'webpackChunk',
           startupEntrypoint: '__webpack_require__.X',
           onChunksLoaded: '__webpack_require__.O',
           externalInstallChunk: '__webpack_require__.C',
           interceptModuleExecution: '__webpack_require__.i',
           global: '__webpack_require__.g',
           shareScopeMap: '__webpack_require__.S',
           initializeSharing: '__webpack_require__.I',
           currentRemoteGetScope: '__webpack_require__.R',
           getUpdateManifestFilename: '__webpack_require__.hmrF',
           hmrDownloadManifest: '__webpack_require__.hmrM',
           hmrDownloadUpdateHandlers: '__webpack_require__.hmrC',
           hmrModuleData: '__webpack_require__.hmrD',
           hmrInvalidateModuleHandlers: '__webpack_require__.hmrI',
           hmrRuntimeStatePrefix: '__webpack_require__.hmrS',
           amdDefine: '__webpack_require__.amdD',
           amdOptions: '__webpack_require__.amdO',
           system: '__webpack_require__.System',
           hasOwnProperty: '__webpack_require__.o',
           systemContext: '__webpack_require__.y',
           baseURI: '__webpack_require__.b',
           relativeUrl: '__webpack_require__.U',
           asyncModule: '__webpack_require__.a'
         },
         RuntimeModule: [class RuntimeModule extends Module] {
           STAGE_NORMAL: 0,
           STAGE_BASIC: 5,
           STAGE_ATTACH: 10,
           STAGE_TRIGGER: 20
         },
         Template: [class Template] {
           NUMBER_OF_IDENTIFIER_START_CHARS: 54,
           NUMBER_OF_IDENTIFIER_CONTINUATION_CHARS: 64
         }
       },
       ProvidePlugin {
         definitions: { Buffer: [ 'buffer', 'Buffer' ], process: [ 'process' ] }
       },
       DefinePlugin {
         definitions: {
           __NEXT_DEFINE_ENV: 'true',
           'process.env.NEXT_PUBLIC_PUBLISHABLE_KEY': '"pk_test_51Mjkx3JOcZO2nuIBU54Vy31qdPatChy88Pt7lNKcD3urPF609Ue5uEdaPEinerCRfaJB68Sg6Mnk9Z2SRyPMjEn100rrK6ru0S"',
           'process.env.NEXT_PUBLIC_POSTHOG_KEY': '"phc_zPk6jVPGyN7BhEHQ0psS02RPjh4wxmHMhvNkkXjL7mG"',
           'process.env.NEXT_PUBLIC_POSTHOG_HOST': '"https://app.posthog.com"',
           'process.turbopack': 'false',
           'process.env.NODE_ENV': '"development"',
           'process.env.NEXT_RUNTIME': undefined,
           'process.env.__NEXT_ACTIONS_DEPLOYMENT_ID': 'false',
           'process.env.NEXT_DEPLOYMENT_ID': undefined,
           'process.env.__NEXT_FETCH_CACHE_KEY_PREFIX': undefined,
           'process.env.__NEXT_PREVIEW_MODE_ID': undefined,
           'process.env.__NEXT_ALLOWED_REVALIDATE_HEADERS': undefined,
           'process.env.__NEXT_MIDDLEWARE_MATCHERS': '[]',
           'process.env.__NEXT_MANUAL_CLIENT_BASE_PATH': 'false',
           'process.env.__NEXT_NEW_LINK_BEHAVIOR': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_FILTER_ENABLED': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_S_FILTER': undefined,
           'process.env.__NEXT_CLIENT_ROUTER_D_FILTER': undefined,
           'process.env.__NEXT_OPTIMISTIC_CLIENT_CACHE': 'true',
           'process.env.__NEXT_MIDDLEWARE_PREFETCH': '"flexible"',
           'process.env.__NEXT_CROSS_ORIGIN': undefined,
           'process.browser': 'true',
           'process.env.__NEXT_TEST_MODE': undefined,
           'process.env.__NEXT_DIST_DIR': '"/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next"',
           'process.env.__NEXT_TRAILING_SLASH': 'false',
           'process.env.__NEXT_BUILD_INDICATOR': 'true',
           'process.env.__NEXT_BUILD_INDICATOR_POSITION': '"bottom-right"',
           'process.env.__NEXT_STRICT_MODE': 'true',
           'process.env.__NEXT_STRICT_MODE_APP': 'true',
           'process.env.__NEXT_OPTIMIZE_FONTS': 'false',
           'process.env.__NEXT_OPTIMIZE_CSS': 'false',
           'process.env.__NEXT_SCRIPT_WORKERS': 'false',
           'process.env.__NEXT_SCROLL_RESTORATION': 'false',
           'process.env.__NEXT_IMAGE_OPTS': '{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","dangerouslyAllowSVG":false,"unoptimized":false,"domains":[],"remotePatterns":[]}',
           'process.env.__NEXT_ROUTER_BASEPATH': '""',
           'process.env.__NEXT_STRICT_NEXT_HEAD': undefined,
           'process.env.__NEXT_HAS_REWRITES': 'false',
           'process.env.__NEXT_CONFIG_OUTPUT': undefined,
           'process.env.__NEXT_I18N_SUPPORT': 'false',
           'process.env.__NEXT_I18N_DOMAINS': undefined,
           'process.env.__NEXT_ANALYTICS_ID': '""',
           'process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE': undefined,
           'process.env.__NEXT_EXTERNAL_MIDDLEWARE_REWRITE_RESOLVE': undefined,
           'process.env.__NEXT_MANUAL_TRAILING_SLASH': undefined,
           'process.env.__NEXT_HAS_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_ASSET_PREFIX': '""'
         }
       },
       ReactLoadablePlugin {
         filename: 'react-loadable-manifest.json',
         pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         runtimeAsset: 'server/middleware-react-loadable-manifest.js',
         dev: true
       },
       DropClientPage { ampPages: Set(0) {} },
       IgnorePlugin {
         options: { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ },
         checkIgnore: [Function: bound checkIgnore]
       },
       NextJsRequireCacheHotReloader {
         prevAssets: null,
         hasServerComponents: true
       },
       HotModuleReplacementPlugin { options: {} },
       BuildManifestPlugin {
         buildId: 'development',
         isDevFallback: false,
         rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
         appDirEnabled: true,
         exportRuntime: true
       },
       ProfilingPlugin {
         runWebpackSpan: Span {
           name: 'hot-reloader',
           parentId: undefined,
           duration: null,
           attrs: { version: '13.4.19' },
           status: 1,
           id: 1,
           _start: 4215254318416n,
           now: 1694175015121
         }
       },
       WellKnownErrorsPlugin {},
       CopyFilePlugin {
         filePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/polyfill-nomodule.js',
         cacheKey: '13.4.19',
         name: 'static/chunks/polyfills.js',
         info: { minimized: true, [Symbol(polyfills)]: 1 }
       },
       AppBuildManifestPlugin { dev: true },
       ClientReferenceManifestPlugin {
         dev: true,
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         appDirBase: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/',
         ASYNC_CLIENT_MODULES: Set(0) {}
       },
       NextFontManifestPlugin {
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app'
       },
       NextMiniCssExtractPlugin {
         _sortedModulesCache: WeakMap { <items unknown> },
         options: {
           filename: 'static/css/[name].css',
           ignoreOrder: true,
           experimentalUseImportModule: undefined,
           runtime: true,
           chunkFilename: 'static/css/[name].css'
         },
         runtimeOptions: {
           insert: undefined,
           linkType: 'text/css',
           attributes: undefined
         },
         __next_css_remove: true
       }
     ],
     experiments: { layers: true, cacheUnaffected: true, buildHttp: undefined },
     snapshot: { managedPaths: [ /^(.+?[\\/]node_modules[\\/])/ ] },
     cache: {
       type: 'filesystem',
       version: '13.4.19|{"appDir":true,"pageExtensions":["tsx","ts","jsx","js"],"trailingSlash":false,"buildActivity":true,"buildActivityPosition":"bottom-right","productionBrowserSourceMaps":false,"reactStrictMode":true,"optimizeFonts":true,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"typedRoutes":false,"basePath":"","pageEnv":false,"excludeDefaultMomentLocales":true,"assetPrefix":"","disableOptimizedLoading":true,"isEdgeRuntime":false,"reactProductionProfiling":false,"webpack":true,"hasRewrites":false,"swcMinify":true,"swcLoader":true,"removeConsole":false,"modularizeImports":{"lodash":{"transform":"lodash/{{member}}"},"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"date-fns":{"transform":"date-fns/{{member}}"},"lodash-es":{"transform":"lodash-es/{{member}}"},"lucide-react":{"transform":{"(SortAsc|LucideSortAsc|SortAscIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react","(SortDesc|LucideSortDesc|SortDescIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react","(Verified|LucideVerified|VerifiedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react","(Slash|LucideSlash|SlashIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react","(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react","(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react","(SquareGantt|LucideSquareGantt|SquareGanttIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react","(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react","(SquareKanban|LucideSquareKanban|SquareKanbanIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react","(Edit3|LucideEdit3|Edit3Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react","(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react","(Edit2|LucideEdit2|Edit2Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react","(Stars|LucideStars|StarsIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react","(TextSelection|LucideTextSelection|TextSelectionIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react","Lucide(.*)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","(.*)Icon":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","*":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react"}},"@headlessui/react":{"transform":{"Transition":"modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react","Tab":"modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react","*":"modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react"},"skipDefaultConversion":true},"@heroicons/react/20/solid":{"transform":"@heroicons/react/20/solid/esm/{{member}}"},"@heroicons/react/24/solid":{"transform":"@heroicons/react/24/solid/esm/{{member}}"},"@heroicons/react/24/outline":{"transform":"@heroicons/react/24/outline/esm/{{member}}"},"ramda":{"transform":"ramda/es/{{member}}"},"react-bootstrap":{"transform":{"useAccordionButton":"modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton","*":"react-bootstrap/{{member}}"}},"antd":{"transform":"antd/lib/{{kebabCase member}}"},"ahooks":{"transform":{"createUpdateEffect":"modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect","*":"ahooks/es/{{member}}"}},"@ant-design/icons":{"transform":{"IconProvider":"modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons","createFromIconfontCN":"@ant-design/icons/es/components/IconFont","getTwoToneColor":"modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","setTwoToneColor":"modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","*":"@ant-design/icons/lib/icons/{{member}}"}},"next/server":{"transform":"next/dist/server/web/exports/{{ kebabCase member }}"}},"legacyBrowsers":false,"imageLoaderFile":""}',
       cacheDirectory: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/webpack',
       compression: 'gzip',
       buildDependencies: {
         config: [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js'
         ]
       },
       name: 'client-development'
     },
     mode: 'development',
     name: 'client',
     target: [ 'web', 'es5' ],
     devtool: 'eval-source-map'
   }
 }
 {
   config: {
     parallelism: undefined,
     externals: [
       'next',
       {
         '@builder.io/partytown': '{}',
         'next/dist/compiled/etag': '{}',
         'next/dist/compiled/chalk': '{}'
       },
       {
         buffer: 'commonjs node:buffer',
         'node:buffer': 'commonjs node:buffer',
         events: 'commonjs node:events',
         'node:events': 'commonjs node:events',
         assert: 'commonjs node:assert',
         'node:assert': 'commonjs node:assert',
         util: 'commonjs node:util',
         'node:util': 'commonjs node:util',
         async_hooks: 'commonjs node:async_hooks',
         'node:async_hooks': 'commonjs node:async_hooks'
       },
       [AsyncFunction: handleWebpackExternalForEdgeRuntime]
     ],
     optimization: {
       emitOnErrors: false,
       checkWasmTypes: false,
       nodeEnv: false,
       splitChunks: false,
       runtimeChunk: undefined,
       minimize: false,
       minimizer: [ [Function (anonymous)], [Function (anonymous)] ],
       usedExports: false
     },
     context: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
     entry: [AsyncFunction: entry],
     watchOptions: {
       aggregateTimeout: 5,
       ignored: /^((?:[^/]*(?:\/|$))*)(\.(git|next)|node_modules)(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/
     },
     output: {
       publicPath: '/_next/',
       path: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/server',
       filename: '[name].js',
       library: '_N_E',
       libraryTarget: 'assign',
       hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
       hotUpdateMainFilename: 'static/webpack/[fullhash].[runtime].hot-update.json',
       chunkFilename: '[name].js',
       strictModuleExceptionHandling: true,
       crossOriginLoading: undefined,
       webassemblyModuleFilename: 'static/wasm/[modulehash].wasm',
       hashFunction: 'xxhash64',
       hashDigestLength: 16,
       enabledLibraryTypes: [ 'assign' ]
     },
     performance: false,
     resolve: {
       extensions: [
         '.mjs',  '.js',
         '.tsx',  '.ts',
         '.jsx',  '.json',
         '.wasm'
       ],
       extensionAlias: undefined,
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src'
       ],
       alias: {
         '@vercel/og': 'next/dist/server/web/spec-extension/image-response',
         'next/dist/build': 'next/dist/esm/build',
         'next/dist/client': 'next/dist/esm/client',
         'next/dist/shared': 'next/dist/esm/shared',
         'next/dist/pages': 'next/dist/esm/pages',
         'next/dist/lib': 'next/dist/esm/lib',
         'next/dist/server': 'next/dist/esm/server',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/server': 'next/dist/esm/server/web/exports/index',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/link': 'next/dist/esm/client/link',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/image-external': 'next/dist/esm/shared/lib/image-external',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/script': 'next/dist/esm/client/script',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/router': 'next/dist/esm/client/router',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/head': 'next/dist/esm/shared/lib/head',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/dynamic': 'next/dist/esm/shared/lib/dynamic',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/pages/_document': 'next/dist/esm/pages/_document',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/pages/_app': 'next/dist/esm/pages/_app',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/components/navigation': 'next/dist/esm/client/components/navigation',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/components/headers': 'next/dist/esm/client/components/headers',
         '@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
         next: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next',
         'styled-jsx/style$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/style.js',
         'styled-jsx$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/index.js',
         'private-next-pages/_app': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.js',
           'next/dist/esm/pages/_app.js'
         ],
         'private-next-pages/_error': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.js',
           'next/dist/esm/pages/_error.js'
         ],
         'private-next-pages/_document': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.js',
           'next/dist/esm/pages/_document.js'
         ],
         'private-next-pages': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         'private-next-app-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         'private-next-root-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
         'private-dot-next': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next',
         'unfetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/index.js',
         'isomorphic-unfetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/index.js',
         'whatwg-fetch$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/fetch/whatwg-fetch.js',
         'object-assign$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object-assign.js',
         'object.assign/auto': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/auto.js',
         'object.assign/implementation': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/implementation.js',
         'object.assign$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/index.js',
         'object.assign/polyfill': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/polyfill.js',
         'object.assign/shim': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/object.assign/shim.js',
         url: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/native-url/index.js',
         'private-next-rsc-action-validate': 'next/dist/build/webpack/loaders/next-flight-loader/action-validate',
         'private-next-rsc-action-client-wrapper': 'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
         'private-next-rsc-action-proxy': 'next/dist/build/webpack/loaders/next-flight-loader/action-proxy',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/router/utils/resolve-rewrites.js': false,
         '@swc/helpers/_': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/@swc+helpers@0.5.1/node_modules/@swc/helpers/_',
         setimmediate: 'next/dist/compiled/setimmediate'
       },
       fallback: {
         process: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/process.js',
         os: false,
         fs: false
       },
       mainFields: [ 'edge-light', 'worker', '...' ],
       conditionNames: [ 'edge-light', 'worker', '...' ],
       plugins: [
         JsConfigPathsPlugin {
           paths: {
             '@/email/*': [ 'src/email/*' ],
             '@/app/*': [ 'src/app/*' ],
             '@/config/*': [ 'src/config/*' ],
             '@/layouts/*': [ 'src/layouts/*' ],
             '@/public/*': [ 'src/public/*' ],
             '@/lib/*': [ 'src/lib/*' ],
             '@/lib/server': [ 'src/business/server/*' ],
             '@/lib/client': [ 'src/lib/client/*' ],
             '@/pages/*': [ 'src/pages/*' ],
             '@/hooks/*': [ 'src/hooks/*' ],
             '@/providers/*': [ 'src/providers/*' ],
             '@/state/*': [ 'src/state/*' ],
             '@/services/*': [ 'src/services/*' ],
             '@/styles/*': [ 'src/styles/*' ],
             '@/utils/*': [ 'src/utils/*' ]
           },
           resolvedBaseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
           jsConfigPlugin: true
         }
       ]
     },
     resolveLoader: {
       alias: {
         'error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/error-loader',
         'next-swc-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-swc-loader',
         'next-client-pages-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-client-pages-loader',
         'next-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-image-loader',
         'next-metadata-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader',
         'next-style-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-style-loader',
         'next-flight-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-loader',
         'next-flight-client-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader',
         'next-flight-action-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-action-entry-loader',
         'next-flight-client-module-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-module-loader',
         'noop-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/noop-loader',
         'next-middleware-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-loader',
         'next-edge-function-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-function-loader',
         'next-edge-app-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-app-route-loader',
         'next-edge-ssr-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-ssr-loader',
         'next-middleware-asset-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-asset-loader',
         'next-middleware-wasm-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-wasm-loader',
         'next-app-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-app-loader',
         'next-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-route-loader',
         'next-font-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-font-loader',
         'next-invalid-import-error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-invalid-import-error-loader',
         'next-metadata-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-route-loader',
         'modularize-import-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/modularize-import-loader'
       },
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules'
       ],
       plugins: []
     },
     module: {
       rules: [
         { issuerLayer: 'edge-asset', type: 'asset/source' },
         {
           dependency: 'url',
           loader: 'next-middleware-asset-loader',
           type: 'javascript/auto',
           layer: 'edge-asset'
         },
         {
           test: /\.wasm$/,
           loader: 'next-middleware-wasm-loader',
           type: 'javascript/auto',
           resourceQuery: /module/i
         },
         {
           layer: 'shared',
           test: /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
         },
         {
           resourceQuery: /__next_metadata_route__/,
           layer: 'app-metadata-route'
         },
         {
           layer: 'ssr',
           test: /next[\\/]dist[\\/](esm[\\/])?server[\\/]future[\\/]route-modules[\\/]app-page[\\/]module/
         },
         {
           issuerLayer: {
             or: [
               'rsc',
               'ssr',
               'app-pages-browser',
               'actionBrowser',
               'shared'
             ]
           },
           resolve: {
             alias: {
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/head.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/components/noop-head.js',
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dynamic.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/app-dynamic.js',
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node'
             }
           }
         },
         {
           issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
           test: {
             and: [
               /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               {
                 not: [
                   /[/\\]node_modules[/\\](@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@jpg-store[/\\]lucid-cardano|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@prisma[/\\]client|@sentry[/\\]nextjs|@sentry[/\\]node|@swc[/\\]core|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|cpu-features|cypress|eslint|express|firebase-admin|jest|jsdom|lodash|mdx-bundler|mongodb|mongoose|next-mdx-remote|next-seo|payload|pg|playwright|postcss|prettier|prisma|puppeteer|rimraf|sharp|shiki|sqlite3|tailwindcss|ts-node|typescript|vscode-oniguruma|webpack)[/\\]/,
                   /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
                 ]
               }
             ]
           },
           resolve: {
             conditionNames: [ 'react-server', 'edge-light', 'worker', '...', '...' ],
             alias: {
               'react$': 'next/dist/compiled/react/react.shared-subset',
               'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
               'server-only$': 'next/dist/compiled/server-only/empty',
               'client-only$': 'next/dist/compiled/client-only/error'
             }
           },
           use: { loader: 'next-flight-loader' }
         },
         { test: /\.m?js/, resolve: { fullySpecified: false } },
         { resourceQuery: /__next_edge_ssr_entry__/, layer: 'rsc' },
         {
           oneOf: [
             {
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               test: {
                 and: [
                   /\.(tsx|ts|js|cjs|mjs|jsx)$/,
                   {
                     not: [
                       /[/\\]node_modules[/\\](@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@jpg-store[/\\]lucid-cardano|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@prisma[/\\]client|@sentry[/\\]nextjs|@sentry[/\\]node|@swc[/\\]core|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|cpu-features|cypress|eslint|express|firebase-admin|jest|jsdom|lodash|mdx-bundler|mongodb|mongoose|next-mdx-remote|next-seo|payload|pg|playwright|postcss|prettier|prisma|puppeteer|rimraf|sharp|shiki|sqlite3|tailwindcss|ts-node|typescript|vscode-oniguruma|webpack)[/\\]/
                     ]
                   }
                 ]
               },
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react/react.shared-subset',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/empty',
                   'client-only$': 'next/dist/compiled/client-only/error'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'ssr',
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/index',
                   'client-only$': 'next/dist/compiled/client-only/index'
                 }
               }
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/google/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/local/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]google[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]local[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               test: /\.(css|scss|sass)$/,
               issuer: /pages[\\/]_document\./,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move global styles to \x1B[36mpages/_app.js\x1B[39m.'
                 }
               }
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               test: [ /\.module\.css$/, /\.module\.(scss|sass)$/ ],
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS Modules \x1B[1mcannot\x1B[22m be imported from within \x1B[1mnode_modules\x1B[22m.\n' +
                     'Read more: https://nextjs.org/docs/messages/css-modules-npm'
                 }
               }
             },
             {
               sideEffects: true,
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: {
                 loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                 options: { cssModules: false }
               }
             },
             {
               sideEffects: true,
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               use: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/ignore-loader/index.js'
             },
             {
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               issuer: {
                 and: [
                   '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web'
                 ],
                 not: [ /layout\.(js|mjs|jsx|ts|tsx)$/ ]
               },
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Global CSS \x1B[1mcannot\x1B[22m be imported from files other than your \x1B[1mCustom <App>\x1B[22m. Due to the Global nature of stylesheets, and to avoid conflicts, Please move all first-party global CSS imports to \x1B[36mpages/_app.js\x1B[39m. Or convert the import to Component-Level CSS (CSS Modules).\n' +
                     'Read more: https://nextjs.org/docs/messages/css-global'
                 }
               }
             },
             {
               test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Images \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move image imports that need to be displayed on every page into \x1B[36mpages/_app.js\x1B[39m.\n' +
                     'Read more: https://nextjs.org/docs/messages/custom-document-image-import'
                 }
               },
               issuer: /pages[\\/]_document\./
             }
           ]
         },
         {
           test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
           issuerLayer: 'app-pages-browser',
           resolve: {
             alias: {
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
               'server-only$': 'next/dist/compiled/server-only/index',
               'client-only$': 'next/dist/compiled/client-only/index'
             }
           }
         },
         {
           oneOf: [
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               issuerLayer: 'api',
               parser: { url: true },
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'middleware',
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               resourceQuery: /__next_edge_ssr_entry__/,
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/,
                 [Function: exclude]
               ],
               issuerLayer: { or: [ 'ssr', 'app-pages-browser' ] },
               use: [
                 { loader: 'next-flight-client-module-loader' },
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: false
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: true,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             }
           ]
         },
         {
           test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
           loader: 'next-image-loader',
           issuer: { not: /\.(css|scss|sass)$/ },
           dependency: { not: [ 'url' ] },
           resourceQuery: {
             not: [
               /__next_metadata__/,
               /__next_metadata_route__/,
               /__next_metadata_image_meta__/
             ]
           },
           options: {
             isDev: true,
             compilerType: 'edge-server',
             basePath: '',
             assetPrefix: ''
           }
         },
         {
           resolve: {
             fallback: {
               process: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/polyfills/process.js'
             }
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]client-only[/\\]error.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
           options: {
             message: "'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component."
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]server-only[/\\]index.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: 'ssr',
           options: {
             message: "'server-only' cannot be imported from a Client Component module. It should only be used from a Server Component."
           }
         },
         {
           test: /[\\/]next[\\/]dist[\\/](esm[\\/])?server[\\/]web[\\/]exports[\\/]image-response\.js/,
           sideEffects: false
         },
         { test: /\.svg$/, use: [ '@svgr/webpack' ] }
       ],
       parser: { javascript: { url: 'relative' } },
       generator: { asset: { filename: 'static/media/[name].[hash:8][ext]' } },
       unsafeCache: [Function (anonymous)]
     },
     plugins: [
       ProvidePlugin { definitions: { Buffer: [ 'buffer', 'Buffer' ] } },
       DefinePlugin {
         definitions: {
           __NEXT_DEFINE_ENV: 'true',
           'process.env.NEXT_PUBLIC_PUBLISHABLE_KEY': '"pk_test_51Mjkx3JOcZO2nuIBU54Vy31qdPatChy88Pt7lNKcD3urPF609Ue5uEdaPEinerCRfaJB68Sg6Mnk9Z2SRyPMjEn100rrK6ru0S"',
           'process.env.NEXT_PUBLIC_POSTHOG_KEY': '"phc_zPk6jVPGyN7BhEHQ0psS02RPjh4wxmHMhvNkkXjL7mG"',
           'process.env.NEXT_PUBLIC_POSTHOG_HOST': '"https://app.posthog.com"',
           EdgeRuntime: '"edge-runtime"',
           'process.turbopack': 'false',
           'process.env.NODE_ENV': '"development"',
           'process.env.NEXT_RUNTIME': '"edge"',
           'process.env.__NEXT_ACTIONS_DEPLOYMENT_ID': 'false',
           'process.env.NEXT_DEPLOYMENT_ID': undefined,
           'process.env.__NEXT_FETCH_CACHE_KEY_PREFIX': undefined,
           'process.env.__NEXT_PREVIEW_MODE_ID': undefined,
           'process.env.__NEXT_ALLOWED_REVALIDATE_HEADERS': undefined,
           'process.env.__NEXT_MIDDLEWARE_MATCHERS': '[]',
           'process.env.__NEXT_MANUAL_CLIENT_BASE_PATH': 'false',
           'process.env.__NEXT_NEW_LINK_BEHAVIOR': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_FILTER_ENABLED': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_S_FILTER': undefined,
           'process.env.__NEXT_CLIENT_ROUTER_D_FILTER': undefined,
           'process.env.__NEXT_OPTIMISTIC_CLIENT_CACHE': 'true',
           'process.env.__NEXT_MIDDLEWARE_PREFETCH': '"flexible"',
           'process.env.__NEXT_CROSS_ORIGIN': undefined,
           'process.browser': 'false',
           'process.env.__NEXT_TEST_MODE': undefined,
           'process.env.__NEXT_DIST_DIR': '"/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next"',
           'process.env.__NEXT_TRAILING_SLASH': 'false',
           'process.env.__NEXT_BUILD_INDICATOR': 'true',
           'process.env.__NEXT_BUILD_INDICATOR_POSITION': '"bottom-right"',
           'process.env.__NEXT_STRICT_MODE': 'true',
           'process.env.__NEXT_STRICT_MODE_APP': 'true',
           'process.env.__NEXT_OPTIMIZE_FONTS': 'false',
           'process.env.__NEXT_OPTIMIZE_CSS': 'false',
           'process.env.__NEXT_SCRIPT_WORKERS': 'false',
           'process.env.__NEXT_SCROLL_RESTORATION': 'false',
           'process.env.__NEXT_IMAGE_OPTS': '{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","dangerouslyAllowSVG":false,"unoptimized":false,"domains":[],"remotePatterns":[]}',
           'process.env.__NEXT_ROUTER_BASEPATH': '""',
           'process.env.__NEXT_STRICT_NEXT_HEAD': undefined,
           'process.env.__NEXT_HAS_REWRITES': 'false',
           'process.env.__NEXT_CONFIG_OUTPUT': undefined,
           'process.env.__NEXT_I18N_SUPPORT': 'false',
           'process.env.__NEXT_I18N_DOMAINS': undefined,
           'process.env.__NEXT_ANALYTICS_ID': '""',
           'process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE': undefined,
           'process.env.__NEXT_EXTERNAL_MIDDLEWARE_REWRITE_RESOLVE': undefined,
           'process.env.__NEXT_MANUAL_TRAILING_SLASH': undefined,
           'process.env.__NEXT_HAS_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_ASSET_PREFIX': '""',
           'global.GENTLY': 'false'
         }
       },
       DropClientPage { ampPages: Set(0) {} },
       IgnorePlugin {
         options: { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ },
         checkIgnore: [Function: bound checkIgnore]
       },
       NextJsRequireCacheHotReloader {
         prevAssets: null,
         hasServerComponents: true
       },
       HotModuleReplacementPlugin { options: {} },
       PagesManifestPlugin {
         dev: true,
         isEdgeRuntime: true,
         appDirEnabled: true
       },
       MiddlewarePlugin { dev: true, sriEnabled: false },
       ProfilingPlugin {
         runWebpackSpan: Span {
           name: 'hot-reloader',
           parentId: undefined,
           duration: null,
           attrs: { version: '13.4.19' },
           status: 1,
           id: 1,
           _start: 4215254318416n,
           now: 1694175015121
         }
       },
       WellKnownErrorsPlugin {},
       FlightClientEntryPlugin {
         dev: true,
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         isEdgeServer: true,
         useServerActions: false,
         serverActionsBodySizeLimit: undefined,
         assetPrefix: ''
       },
       NextTypesPlugin {
         dir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
         distDir: '.next',
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         dev: true,
         isEdgeServer: true,
         pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
         pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         typedRoutes: false,
         distDirAbsolutePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next'
       }
     ],
     experiments: { layers: true, cacheUnaffected: true, buildHttp: undefined },
     snapshot: { managedPaths: [ /^(.+?[\\/]node_modules[\\/])/ ] },
     cache: {
       type: 'filesystem',
       version: '13.4.19|{"appDir":true,"pageExtensions":["tsx","ts","jsx","js"],"trailingSlash":false,"buildActivity":true,"buildActivityPosition":"bottom-right","productionBrowserSourceMaps":false,"reactStrictMode":true,"optimizeFonts":true,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"typedRoutes":false,"basePath":"","pageEnv":false,"excludeDefaultMomentLocales":true,"assetPrefix":"","disableOptimizedLoading":true,"isEdgeRuntime":true,"reactProductionProfiling":false,"webpack":true,"hasRewrites":false,"swcMinify":true,"swcLoader":true,"removeConsole":false,"modularizeImports":{"lodash":{"transform":"lodash/{{member}}"},"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"date-fns":{"transform":"date-fns/{{member}}"},"lodash-es":{"transform":"lodash-es/{{member}}"},"lucide-react":{"transform":{"(SortAsc|LucideSortAsc|SortAscIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react","(SortDesc|LucideSortDesc|SortDescIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react","(Verified|LucideVerified|VerifiedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react","(Slash|LucideSlash|SlashIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react","(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react","(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react","(SquareGantt|LucideSquareGantt|SquareGanttIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react","(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react","(SquareKanban|LucideSquareKanban|SquareKanbanIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react","(Edit3|LucideEdit3|Edit3Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react","(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react","(Edit2|LucideEdit2|Edit2Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react","(Stars|LucideStars|StarsIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react","(TextSelection|LucideTextSelection|TextSelectionIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react","Lucide(.*)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","(.*)Icon":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","*":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react"}},"@headlessui/react":{"transform":{"Transition":"modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react","Tab":"modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react","*":"modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react"},"skipDefaultConversion":true},"@heroicons/react/20/solid":{"transform":"@heroicons/react/20/solid/esm/{{member}}"},"@heroicons/react/24/solid":{"transform":"@heroicons/react/24/solid/esm/{{member}}"},"@heroicons/react/24/outline":{"transform":"@heroicons/react/24/outline/esm/{{member}}"},"ramda":{"transform":"ramda/es/{{member}}"},"react-bootstrap":{"transform":{"useAccordionButton":"modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton","*":"react-bootstrap/{{member}}"}},"antd":{"transform":"antd/lib/{{kebabCase member}}"},"ahooks":{"transform":{"createUpdateEffect":"modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect","*":"ahooks/es/{{member}}"}},"@ant-design/icons":{"transform":{"IconProvider":"modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons","createFromIconfontCN":"@ant-design/icons/es/components/IconFont","getTwoToneColor":"modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","setTwoToneColor":"modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","*":"@ant-design/icons/lib/icons/{{member}}"}},"next/server":{"transform":"next/dist/server/web/exports/{{ kebabCase member }}"}},"legacyBrowsers":false,"imageLoaderFile":""}',
       cacheDirectory: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/webpack',
       compression: 'gzip',
       buildDependencies: {
         config: [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js'
         ]
       },
       name: 'edge-server-development'
     },
     mode: 'development',
     name: 'edge-server',
     target: [ 'web', 'es6' ],
     devtool: 'eval-source-map'
   }
 }
 {
   config: {
     parallelism: undefined,
     externalsPresets: { node: true },
     externals: [ [Function (anonymous)] ],
     optimization: {
       emitOnErrors: false,
       checkWasmTypes: false,
       nodeEnv: false,
       splitChunks: false,
       runtimeChunk: undefined,
       minimize: false,
       minimizer: [ [Function (anonymous)], [Function (anonymous)] ],
       usedExports: false
     },
     context: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
     entry: [AsyncFunction: entry],
     watchOptions: {
       aggregateTimeout: 5,
       ignored: /^((?:[^/]*(?:\/|$))*)(\.(git|next)|node_modules)(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/
     },
     output: {
       publicPath: '/_next/',
       path: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/server',
       filename: '[name].js',
       library: undefined,
       libraryTarget: 'commonjs2',
       hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
       hotUpdateMainFilename: 'static/webpack/[fullhash].[runtime].hot-update.json',
       chunkFilename: '[name].js',
       strictModuleExceptionHandling: true,
       crossOriginLoading: undefined,
       webassemblyModuleFilename: 'static/wasm/[modulehash].wasm',
       hashFunction: 'xxhash64',
       hashDigestLength: 16
     },
     performance: false,
     resolve: {
       extensions: [
         '.js',   '.mjs',
         '.tsx',  '.ts',
         '.jsx',  '.json',
         '.wasm'
       ],
       extensionAlias: undefined,
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src'
       ],
       alias: {
         '@vercel/og': 'next/dist/server/web/spec-extension/image-response',
         '@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
         next: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next',
         'styled-jsx/style$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/style.js',
         'styled-jsx$': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/styled-jsx@5.1.1_6cbj5f22524lxd3fxvtkdiim3q/node_modules/styled-jsx/index.js',
         'private-next-pages/_app': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_app.js',
           'next/dist/pages/_app.js'
         ],
         'private-next-pages/_error': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_error.js',
           'next/dist/pages/_error.js'
         ],
         'private-next-pages/_document': [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.tsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.ts',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.jsx',
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages/_document.js',
           'next/dist/pages/_document.js'
         ],
         'private-next-pages': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         'private-next-app-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         'private-next-root-dir': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
         'private-dot-next': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next',
         'private-next-rsc-action-validate': 'next/dist/build/webpack/loaders/next-flight-loader/action-validate',
         'private-next-rsc-action-client-wrapper': 'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
         'private-next-rsc-action-proxy': 'next/dist/build/webpack/loaders/next-flight-loader/action-proxy',
         '@swc/helpers/_': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/@swc+helpers@0.5.1/node_modules/@swc/helpers/_',
         setimmediate: 'next/dist/compiled/setimmediate'
       },
       mainFields: [ 'main', 'module' ],
       plugins: [
         JsConfigPathsPlugin {
           paths: {
             '@/email/*': [ 'src/email/*' ],
             '@/app/*': [ 'src/app/*' ],
             '@/config/*': [ 'src/config/*' ],
             '@/layouts/*': [ 'src/layouts/*' ],
             '@/public/*': [ 'src/public/*' ],
             '@/lib/*': [ 'src/lib/*' ],
             '@/lib/server': [ 'src/business/server/*' ],
             '@/lib/client': [ 'src/lib/client/*' ],
             '@/pages/*': [ 'src/pages/*' ],
             '@/hooks/*': [ 'src/hooks/*' ],
             '@/providers/*': [ 'src/providers/*' ],
             '@/state/*': [ 'src/state/*' ],
             '@/services/*': [ 'src/services/*' ],
             '@/styles/*': [ 'src/styles/*' ],
             '@/utils/*': [ 'src/utils/*' ]
           },
           resolvedBaseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
           jsConfigPlugin: true
         }
       ],
       fallback: { os: false, fs: false }
     },
     resolveLoader: {
       alias: {
         'error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/error-loader',
         'next-swc-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-swc-loader',
         'next-client-pages-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-client-pages-loader',
         'next-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-image-loader',
         'next-metadata-image-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader',
         'next-style-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-style-loader',
         'next-flight-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-loader',
         'next-flight-client-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader',
         'next-flight-action-entry-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-action-entry-loader',
         'next-flight-client-module-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-client-module-loader',
         'noop-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/noop-loader',
         'next-middleware-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-loader',
         'next-edge-function-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-function-loader',
         'next-edge-app-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-app-route-loader',
         'next-edge-ssr-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-edge-ssr-loader',
         'next-middleware-asset-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-asset-loader',
         'next-middleware-wasm-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-middleware-wasm-loader',
         'next-app-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-app-loader',
         'next-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-route-loader',
         'next-font-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-font-loader',
         'next-invalid-import-error-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-invalid-import-error-loader',
         'next-metadata-route-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-metadata-route-loader',
         'modularize-import-loader': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/modularize-import-loader'
       },
       modules: [
         'node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules',
         '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/node_modules'
       ],
       plugins: []
     },
     module: {
       rules: [
         {
           layer: 'shared',
           test: /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
         },
         {
           resourceQuery: /__next_metadata_route__/,
           layer: 'app-metadata-route'
         },
         {
           layer: 'ssr',
           test: /next[\\/]dist[\\/](esm[\\/])?server[\\/]future[\\/]route-modules[\\/]app-page[\\/]module/
         },
         {
           issuerLayer: {
             or: [
               'rsc',
               'ssr',
               'app-pages-browser',
               'actionBrowser',
               'shared'
             ]
           },
           resolve: {
             alias: {
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/head.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/client/components/noop-head.js',
               '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dynamic.js': '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/shared/lib/app-dynamic.js',
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node'
             }
           }
         },
         {
           issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
           test: {
             and: [
               /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               {
                 not: [
                   /[/\\]node_modules[/\\](@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@jpg-store[/\\]lucid-cardano|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@prisma[/\\]client|@sentry[/\\]nextjs|@sentry[/\\]node|@swc[/\\]core|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|cpu-features|cypress|eslint|express|firebase-admin|jest|jsdom|lodash|mdx-bundler|mongodb|mongoose|next-mdx-remote|next-seo|payload|pg|playwright|postcss|prettier|prisma|puppeteer|rimraf|sharp|shiki|sqlite3|tailwindcss|ts-node|typescript|vscode-oniguruma|webpack)[/\\]/,
                   /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
                 ]
               }
             ]
           },
           resolve: {
             conditionNames: [ 'react-server', '...' ],
             alias: {
               'react$': 'next/dist/compiled/react/react.shared-subset',
               'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
               'server-only$': 'next/dist/compiled/server-only/empty',
               'client-only$': 'next/dist/compiled/client-only/error'
             }
           },
           use: { loader: 'next-flight-loader' }
         },
         { test: /\.m?js/, resolve: { fullySpecified: false } },
         {
           oneOf: [
             {
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               test: {
                 and: [
                   /\.(tsx|ts|js|cjs|mjs|jsx)$/,
                   {
                     not: [
                       /[/\\]node_modules[/\\](@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@jpg-store[/\\]lucid-cardano|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@prisma[/\\]client|@sentry[/\\]nextjs|@sentry[/\\]node|@swc[/\\]core|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|cpu-features|cypress|eslint|express|firebase-admin|jest|jsdom|lodash|mdx-bundler|mongodb|mongoose|next-mdx-remote|next-seo|payload|pg|playwright|postcss|prettier|prisma|puppeteer|rimraf|sharp|shiki|sqlite3|tailwindcss|ts-node|typescript|vscode-oniguruma|webpack)[/\\]/
                     ]
                   }
                 ]
               },
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react/react.shared-subset',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/empty',
                   'client-only$': 'next/dist/compiled/client-only/error'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'ssr',
               resolve: {
                 alias: {
                   'react$': 'next/dist/compiled/react',
                   'react-dom$': 'next/dist/compiled/react-dom/server-rendering-stub',
                   'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
                   'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
                   'react-dom/client$': 'next/dist/compiled/react-dom/client',
                   'react-dom/server$': 'next/dist/compiled/react-dom/server',
                   'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
                   'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
                   'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
                   'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
                   'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
                   'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
                   'server-only$': 'next/dist/compiled/server-only/index',
                   'client-only$': 'next/dist/compiled/client-only/index'
                 }
               }
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/google/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/font/local/target.css',
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]google[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/google/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /node_modules[\\/]@next[\\/]font[\\/]local[\\/]target.css/,
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getLocalIdent]
                     },
                     fontLoader: true
                   }
                 },
                 {
                   loader: 'next-font-loader',
                   options: {
                     isDev: true,
                     isServer: true,
                     assetPrefix: '',
                     fontLoaderPath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/@next/font/local/loader.js',
                     postcss: [Function: lazyPostCSSInitializer]
                   }
                 }
               ]
             },
             {
               test: /\.(css|scss|sass)$/,
               issuer: /pages[\\/]_document\./,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move global styles to \x1B[36mpages/_app.js\x1B[39m.'
                 }
               }
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.css$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 1,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                   options: { cssModules: true }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               sideEffects: false,
               test: /\.module\.(scss|sass)$/,
               issuerLayer: { not: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: [
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     importLoaders: 3,
                     esModule: false,
                     url: [Function: url],
                     import: [Function: import],
                     modules: {
                       exportLocalsConvention: 'asIs',
                       exportOnlyLocals: true,
                       mode: 'pure',
                       getLocalIdent: [Function: getCssModuleLocalIdent]
                     }
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js',
                   options: { postcss: [Function: lazyPostCSSInitializer] }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js',
                   options: {
                     postcss: [Function: lazyPostCSSInitializer],
                     sourceMap: true
                   }
                 },
                 {
                   loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/sass-loader/cjs.js',
                   options: {
                     sourceMap: true,
                     sassOptions: { fibers: false },
                     additionalData: undefined
                   }
                 }
               ]
             },
             {
               test: [ /\.module\.css$/, /\.module\.(scss|sass)$/ ],
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'CSS Modules \x1B[1mcannot\x1B[22m be imported from within \x1B[1mnode_modules\x1B[22m.\n' +
                     'Read more: https://nextjs.org/docs/messages/css-modules-npm'
                 }
               }
             },
             {
               sideEffects: true,
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               issuerLayer: { or: [ 'rsc', 'ssr', 'app-pages-browser' ] },
               use: {
                 loader: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/build/webpack/loaders/next-flight-css-loader.js',
                 options: { cssModules: false }
               }
             },
             {
               sideEffects: true,
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               use: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/node_modules/.pnpm/next@13.4.19_ng3hjngmeb53o2yidgazeud7lu/node_modules/next/dist/compiled/ignore-loader/index.js'
             },
             {
               test: [ /(?<!\.module)\.css$/, /(?<!\.module)\.(scss|sass)$/ ],
               issuer: {
                 and: [
                   '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web'
                 ],
                 not: [ /layout\.(js|mjs|jsx|ts|tsx)$/ ]
               },
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Global CSS \x1B[1mcannot\x1B[22m be imported from files other than your \x1B[1mCustom <App>\x1B[22m. Due to the Global nature of stylesheets, and to avoid conflicts, Please move all first-party global CSS imports to \x1B[36mpages/_app.js\x1B[39m. Or convert the import to Component-Level CSS (CSS Modules).\n' +
                     'Read more: https://nextjs.org/docs/messages/css-global'
                 }
               }
             },
             {
               test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
               use: {
                 loader: 'error-loader',
                 options: {
                   reason: 'Images \x1B[1mcannot\x1B[22m be imported within \x1B[36mpages/_document.js\x1B[39m. Please move image imports that need to be displayed on every page into \x1B[36mpages/_app.js\x1B[39m.\n' +
                     'Read more: https://nextjs.org/docs/messages/custom-document-image-import'
                 }
               },
               issuer: /pages[\\/]_document\./
             }
           ]
         },
         {
           test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
           issuerLayer: 'app-pages-browser',
           resolve: {
             alias: {
               'react$': 'next/dist/compiled/react',
               'react-dom$': 'next/dist/compiled/react-dom',
               'react/jsx-runtime$': 'next/dist/compiled/react/jsx-runtime',
               'react/jsx-dev-runtime$': 'next/dist/compiled/react/jsx-dev-runtime',
               'react-dom/client$': 'next/dist/compiled/react-dom/client',
               'react-dom/server$': 'next/dist/compiled/react-dom/server',
               'react-dom/server.edge$': 'next/dist/compiled/react-dom/server.edge',
               'react-dom/server.browser$': 'next/dist/compiled/react-dom/server.browser',
               'react-server-dom-webpack/client$': 'next/dist/compiled/react-server-dom-webpack/client',
               'react-server-dom-webpack/client.edge$': 'next/dist/compiled/react-server-dom-webpack/client.edge',
               'react-server-dom-webpack/server.edge$': 'next/dist/compiled/react-server-dom-webpack/server.edge',
               'react-server-dom-webpack/server.node$': 'next/dist/compiled/react-server-dom-webpack/server.node',
               'server-only$': 'next/dist/compiled/server-only/index',
               'client-only$': 'next/dist/compiled/client-only/index'
             }
           }
         },
         {
           oneOf: [
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               issuerLayer: 'api',
               parser: { url: true },
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: 'middleware',
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: false,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/
               ],
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               resourceQuery: /__next_edge_ssr_entry__/,
               use: [
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: true
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [
                 /next[\\/]dist[\\/](esm[\\/])?client[\\/]components[\\/](static-generation-async-storage|action-async-storage|request-async-storage)/,
                 [Function: exclude]
               ],
               issuerLayer: { or: [ 'ssr', 'app-pages-browser' ] },
               use: [
                 { loader: 'next-flight-client-module-loader' },
                 {
                   loader: 'next-swc-loader',
                   options: {
                     isServer: true,
                     rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                     pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                     appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                     hasReactRefresh: false,
                     hasServerComponents: true,
                     fileReading: true,
                     nextConfig: {
                       env: {},
                       webpack: [Function: webpack],
                       eslint: { ignoreDuringBuilds: false },
                       typescript: {
                         ignoreBuildErrors: false,
                         tsconfigPath: 'tsconfig.json'
                       },
                       distDir: '.next',
                       cleanDistDir: true,
                       assetPrefix: '',
                       configOrigin: 'next.config.js',
                       useFileSystemPublicRoutes: true,
                       generateBuildId: [Function: generateBuildId],
                       generateEtags: true,
                       pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                       poweredByHeader: false,
                       compress: true,
                       analyticsId: '',
                       images: {
                         deviceSizes: [
                            640,  750,  828,
                           1080, 1200, 1920,
                           2048, 3840
                         ],
                         imageSizes: [
                           16,  32,  48,  64,
                           96, 128, 256, 384
                         ],
                         path: '/_next/image',
                         loader: 'default',
                         loaderFile: '',
                         domains: [],
                         disableStaticImages: false,
                         minimumCacheTTL: 60,
                         formats: [ 'image/webp' ],
                         dangerouslyAllowSVG: false,
                         contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                         contentDispositionType: 'inline',
                         remotePatterns: [],
                         unoptimized: false
                       },
                       devIndicators: {
                         buildActivity: true,
                         buildActivityPosition: 'bottom-right'
                       },
                       onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                       amp: { canonicalBase: '' },
                       basePath: '',
                       sassOptions: {},
                       trailingSlash: false,
                       i18n: null,
                       productionBrowserSourceMaps: false,
                       optimizeFonts: true,
                       excludeDefaultMomentLocales: true,
                       serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                       publicRuntimeConfig: {},
                       reactProductionProfiling: false,
                       reactStrictMode: true,
                       httpAgentOptions: { keepAlive: true },
                       outputFileTracing: true,
                       staticPageGenerationTimeout: 60,
                       swcMinify: true,
                       output: undefined,
                       modularizeImports: {
                         lodash: { transform: 'lodash/{{member}}' },
                         '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                         'date-fns': { transform: 'date-fns/{{member}}' },
                         'lodash-es': { transform: 'lodash-es/{{member}}' },
                         'lucide-react': {
                           transform: {
                             '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                             '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                             '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                             '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                             '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                             '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                             '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                             '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                             '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                             '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                             '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                             '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                             '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                             '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                             'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                             '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                           }
                         },
                         '@headlessui/react': {
                           transform: {
                             Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                             Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                             '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                           },
                           skipDefaultConversion: true
                         },
                         '@heroicons/react/20/solid': {
                           transform: '@heroicons/react/20/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/solid': {
                           transform: '@heroicons/react/24/solid/esm/{{member}}'
                         },
                         '@heroicons/react/24/outline': {
                           transform: '@heroicons/react/24/outline/esm/{{member}}'
                         },
                         ramda: { transform: 'ramda/es/{{member}}' },
                         'react-bootstrap': {
                           transform: {
                             useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                             '*': 'react-bootstrap/{{member}}'
                           }
                         },
                         antd: { transform: 'antd/lib/{{kebabCase member}}' },
                         ahooks: {
                           transform: {
                             createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                             '*': 'ahooks/es/{{member}}'
                           }
                         },
                         '@ant-design/icons': {
                           transform: {
                             IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                             createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                             getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                             '*': '@ant-design/icons/lib/icons/{{member}}'
                           }
                         },
                         'next/server': {
                           transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                         }
                       },
                       experimental: {
                         serverMinification: false,
                         serverSourceMaps: false,
                         caseSensitiveRoutes: false,
                         useDeploymentId: false,
                         deploymentId: undefined,
                         useDeploymentIdServerActions: false,
                         appDocumentPreloading: undefined,
                         clientRouterFilter: true,
                         clientRouterFilterRedirects: false,
                         fetchCacheKeyPrefix: '',
                         middlewarePrefetch: 'flexible',
                         optimisticClientCache: true,
                         manualClientBasePath: false,
                         legacyBrowsers: false,
                         newNextLinkBehavior: true,
                         cpus: 7,
                         memoryBasedWorkersCount: false,
                         sharedPool: true,
                         isrFlushToDisk: true,
                         workerThreads: false,
                         pageEnv: false,
                         proxyTimeout: undefined,
                         optimizeCss: false,
                         nextScriptWorkers: false,
                         scrollRestoration: false,
                         externalDir: false,
                         disableOptimizedLoading: false,
                         gzipSize: true,
                         swcFileReading: true,
                         craCompat: false,
                         esmExternals: true,
                         appDir: true,
                         isrMemoryCacheSize: 52428800,
                         incrementalCacheHandlerPath: undefined,
                         fullySpecified: false,
                         outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                         swcTraceProfiling: false,
                         forceSwcTransforms: false,
                         swcPlugins: undefined,
                         largePageDataBytes: 128000,
                         disablePostcssPresetEnv: undefined,
                         amp: undefined,
                         urlImports: undefined,
                         adjustFontFallbacks: false,
                         adjustFontFallbacksWithSizeAdjust: false,
                         turbo: undefined,
                         turbotrace: undefined,
                         typedRoutes: false,
                         instrumentationHook: false
                       },
                       configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                       configFileName: 'next.config.js',
                       transpilePackages: [
                         '@glyphx/codegen',
                         'core',
                         'business',
                         'database',
                         'email',
                         'fileingestion',
                         'glyphengine',
                         'types'
                       ],
                       compiler: { removeConsole: false }
                     },
                     jsConfig: {
                       compilerOptions: {
                         target: 2,
                         lib: [
                           'lib.dom.d.ts',
                           'lib.dom.iterable.d.ts',
                           'lib.esnext.d.ts'
                         ],
                         baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                         paths: {
                           '@/email/*': [ 'src/email/*' ],
                           '@/app/*': [ 'src/app/*' ],
                           '@/config/*': [ 'src/config/*' ],
                           '@/layouts/*': [ 'src/layouts/*' ],
                           '@/public/*': [ 'src/public/*' ],
                           '@/lib/*': [ 'src/lib/*' ],
                           '@/lib/server': [ 'src/business/server/*' ],
                           '@/lib/client': [ 'src/lib/client/*' ],
                           '@/pages/*': [ 'src/pages/*' ],
                           '@/hooks/*': [ 'src/hooks/*' ],
                           '@/providers/*': [ 'src/providers/*' ],
                           '@/state/*': [ 'src/state/*' ],
                           '@/services/*': [ 'src/services/*' ],
                           '@/styles/*': [ 'src/styles/*' ],
                           '@/utils/*': [ 'src/utils/*' ]
                         },
                         allowJs: true,
                         skipLibCheck: true,
                         strict: false,
                         forceConsistentCasingInFileNames: true,
                         noEmit: true,
                         incremental: true,
                         esModuleInterop: true,
                         module: 1,
                         resolveJsonModule: true,
                         moduleResolution: 2,
                         isolatedModules: true,
                         jsx: 1,
                         experimentalDecorators: true,
                         emitDecoratorMetadata: true,
                         plugins: [ { name: 'next' } ],
                         strictNullChecks: true,
                         pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                         configFilePath: undefined
                       }
                     },
                     supportedBrowsers: [
                       'chrome 64',
                       'edge 79',
                       'firefox 67',
                       'opera 51',
                       'safari 12'
                     ],
                     swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc',
                     isServerLayer: false
                   }
                 }
               ]
             },
             {
               test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
               exclude: [Function: exclude],
               use: {
                 loader: 'next-swc-loader',
                 options: {
                   isServer: true,
                   rootDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                   pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
                   appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
                   hasReactRefresh: false,
                   hasServerComponents: true,
                   fileReading: true,
                   nextConfig: {
                     env: {},
                     webpack: [Function: webpack],
                     eslint: { ignoreDuringBuilds: false },
                     typescript: {
                       ignoreBuildErrors: false,
                       tsconfigPath: 'tsconfig.json'
                     },
                     distDir: '.next',
                     cleanDistDir: true,
                     assetPrefix: '',
                     configOrigin: 'next.config.js',
                     useFileSystemPublicRoutes: true,
                     generateBuildId: [Function: generateBuildId],
                     generateEtags: true,
                     pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
                     poweredByHeader: false,
                     compress: true,
                     analyticsId: '',
                     images: {
                       deviceSizes: [
                          640,  750,  828,
                         1080, 1200, 1920,
                         2048, 3840
                       ],
                       imageSizes: [
                         16,  32,  48,  64,
                         96, 128, 256, 384
                       ],
                       path: '/_next/image',
                       loader: 'default',
                       loaderFile: '',
                       domains: [],
                       disableStaticImages: false,
                       minimumCacheTTL: 60,
                       formats: [ 'image/webp' ],
                       dangerouslyAllowSVG: false,
                       contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
                       contentDispositionType: 'inline',
                       remotePatterns: [],
                       unoptimized: false
                     },
                     devIndicators: {
                       buildActivity: true,
                       buildActivityPosition: 'bottom-right'
                     },
                     onDemandEntries: { maxInactiveAge: 25000, pagesBufferLength: 2 },
                     amp: { canonicalBase: '' },
                     basePath: '',
                     sassOptions: {},
                     trailingSlash: false,
                     i18n: null,
                     productionBrowserSourceMaps: false,
                     optimizeFonts: true,
                     excludeDefaultMomentLocales: true,
                     serverRuntimeConfig: { maxPayloadSize: 1073741824 },
                     publicRuntimeConfig: {},
                     reactProductionProfiling: false,
                     reactStrictMode: true,
                     httpAgentOptions: { keepAlive: true },
                     outputFileTracing: true,
                     staticPageGenerationTimeout: 60,
                     swcMinify: true,
                     output: undefined,
                     modularizeImports: {
                       lodash: { transform: 'lodash/{{member}}' },
                       '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
                       'date-fns': { transform: 'date-fns/{{member}}' },
                       'lodash-es': { transform: 'lodash-es/{{member}}' },
                       'lucide-react': {
                         transform: {
                           '(SortAsc|LucideSortAsc|SortAscIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react',
                           '(SortDesc|LucideSortDesc|SortDescIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react',
                           '(Verified|LucideVerified|VerifiedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react',
                           '(Slash|LucideSlash|SlashIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react',
                           '(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react',
                           '(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react',
                           '(SquareGantt|LucideSquareGantt|SquareGanttIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react',
                           '(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react',
                           '(SquareKanban|LucideSquareKanban|SquareKanbanIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react',
                           '(Edit3|LucideEdit3|Edit3Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react',
                           '(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react',
                           '(Edit2|LucideEdit2|Edit2Icon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react',
                           '(Stars|LucideStars|StarsIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react',
                           '(TextSelection|LucideTextSelection|TextSelectionIcon)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react',
                           'Lucide(.*)': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '(.*)Icon': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react',
                           '*': 'modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react'
                         }
                       },
                       '@headlessui/react': {
                         transform: {
                           Transition: 'modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react',
                           Tab: 'modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react',
                           '*': 'modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react'
                         },
                         skipDefaultConversion: true
                       },
                       '@heroicons/react/20/solid': {
                         transform: '@heroicons/react/20/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/solid': {
                         transform: '@heroicons/react/24/solid/esm/{{member}}'
                       },
                       '@heroicons/react/24/outline': {
                         transform: '@heroicons/react/24/outline/esm/{{member}}'
                       },
                       ramda: { transform: 'ramda/es/{{member}}' },
                       'react-bootstrap': {
                         transform: {
                           useAccordionButton: 'modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton',
                           '*': 'react-bootstrap/{{member}}'
                         }
                       },
                       antd: { transform: 'antd/lib/{{kebabCase member}}' },
                       ahooks: {
                         transform: {
                           createUpdateEffect: 'modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect',
                           '*': 'ahooks/es/{{member}}'
                         }
                       },
                       '@ant-design/icons': {
                         transform: {
                           IconProvider: 'modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons',
                           createFromIconfontCN: '@ant-design/icons/es/components/IconFont',
                           getTwoToneColor: 'modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           setTwoToneColor: 'modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor',
                           '*': '@ant-design/icons/lib/icons/{{member}}'
                         }
                       },
                       'next/server': {
                         transform: 'next/dist/server/web/exports/{{ kebabCase member }}'
                       }
                     },
                     experimental: {
                       serverMinification: false,
                       serverSourceMaps: false,
                       caseSensitiveRoutes: false,
                       useDeploymentId: false,
                       deploymentId: undefined,
                       useDeploymentIdServerActions: false,
                       appDocumentPreloading: undefined,
                       clientRouterFilter: true,
                       clientRouterFilterRedirects: false,
                       fetchCacheKeyPrefix: '',
                       middlewarePrefetch: 'flexible',
                       optimisticClientCache: true,
                       manualClientBasePath: false,
                       legacyBrowsers: false,
                       newNextLinkBehavior: true,
                       cpus: 7,
                       memoryBasedWorkersCount: false,
                       sharedPool: true,
                       isrFlushToDisk: true,
                       workerThreads: false,
                       pageEnv: false,
                       proxyTimeout: undefined,
                       optimizeCss: false,
                       nextScriptWorkers: false,
                       scrollRestoration: false,
                       externalDir: false,
                       disableOptimizedLoading: false,
                       gzipSize: true,
                       swcFileReading: true,
                       craCompat: false,
                       esmExternals: true,
                       appDir: true,
                       isrMemoryCacheSize: 52428800,
                       incrementalCacheHandlerPath: undefined,
                       fullySpecified: false,
                       outputFileTracingRoot: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo',
                       swcTraceProfiling: false,
                       forceSwcTransforms: false,
                       swcPlugins: undefined,
                       largePageDataBytes: 128000,
                       disablePostcssPresetEnv: undefined,
                       amp: undefined,
                       urlImports: undefined,
                       adjustFontFallbacks: false,
                       adjustFontFallbacksWithSizeAdjust: false,
                       turbo: undefined,
                       turbotrace: undefined,
                       typedRoutes: false,
                       instrumentationHook: false
                     },
                     configFile: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js',
                     configFileName: 'next.config.js',
                     transpilePackages: [
                       '@glyphx/codegen',
                       'core',
                       'business',
                       'database',
                       'email',
                       'fileingestion',
                       'glyphengine',
                       'types'
                     ],
                     compiler: { removeConsole: false }
                   },
                   jsConfig: {
                     compilerOptions: {
                       target: 2,
                       lib: [
                         'lib.dom.d.ts',
                         'lib.dom.iterable.d.ts',
                         'lib.esnext.d.ts'
                       ],
                       baseUrl: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src',
                       paths: {
                         '@/email/*': [ 'src/email/*' ],
                         '@/app/*': [ 'src/app/*' ],
                         '@/config/*': [ 'src/config/*' ],
                         '@/layouts/*': [ 'src/layouts/*' ],
                         '@/public/*': [ 'src/public/*' ],
                         '@/lib/*': [ 'src/lib/*' ],
                         '@/lib/server': [ 'src/business/server/*' ],
                         '@/lib/client': [ 'src/lib/client/*' ],
                         '@/pages/*': [ 'src/pages/*' ],
                         '@/hooks/*': [ 'src/hooks/*' ],
                         '@/providers/*': [ 'src/providers/*' ],
                         '@/state/*': [ 'src/state/*' ],
                         '@/services/*': [ 'src/services/*' ],
                         '@/styles/*': [ 'src/styles/*' ],
                         '@/utils/*': [ 'src/utils/*' ]
                       },
                       allowJs: true,
                       skipLibCheck: true,
                       strict: false,
                       forceConsistentCasingInFileNames: true,
                       noEmit: true,
                       incremental: true,
                       esModuleInterop: true,
                       module: 1,
                       resolveJsonModule: true,
                       moduleResolution: 2,
                       isolatedModules: true,
                       jsx: 1,
                       experimentalDecorators: true,
                       emitDecoratorMetadata: true,
                       plugins: [ { name: 'next' } ],
                       strictNullChecks: true,
                       pathsBasePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
                       configFilePath: undefined
                     }
                   },
                   supportedBrowsers: [
                     'chrome 64',
                     'edge 79',
                     'firefox 67',
                     'opera 51',
                     'safari 12'
                   ],
                   swcCacheDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/swc'
                 }
               }
             }
           ]
         },
         {
           test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
           loader: 'next-image-loader',
           issuer: { not: /\.(css|scss|sass)$/ },
           dependency: { not: [ 'url' ] },
           resourceQuery: {
             not: [
               /__next_metadata__/,
               /__next_metadata_route__/,
               /__next_metadata_image_meta__/
             ]
           },
           options: {
             isDev: true,
             compilerType: 'server',
             basePath: '',
             assetPrefix: ''
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]client-only[/\\]error.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: { or: [ [Function: isWebpackServerLayer] ] },
           options: {
             message: "'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component."
           }
         },
         {
           test: /(node_modules|next[/\\]dist[/\\]compiled)[/\\]server-only[/\\]index.js/,
           loader: 'next-invalid-import-error-loader',
           issuerLayer: 'ssr',
           options: {
             message: "'server-only' cannot be imported from a Client Component module. It should only be used from a Server Component."
           }
         },
         {
           test: /[\\/]next[\\/]dist[\\/](esm[\\/])?server[\\/]web[\\/]exports[\\/]image-response\.js/,
           sideEffects: false
         },
         { test: /\.svg$/, use: [ '@svgr/webpack' ] }
       ],
       parser: { javascript: { url: 'relative' } },
       generator: { asset: { filename: 'static/media/[name].[hash:8][ext]' } },
       unsafeCache: [Function (anonymous)]
     },
     plugins: [
       DefinePlugin {
         definitions: {
           __NEXT_DEFINE_ENV: 'true',
           'process.env.NEXT_PUBLIC_PUBLISHABLE_KEY': '"pk_test_51Mjkx3JOcZO2nuIBU54Vy31qdPatChy88Pt7lNKcD3urPF609Ue5uEdaPEinerCRfaJB68Sg6Mnk9Z2SRyPMjEn100rrK6ru0S"',
           'process.env.NEXT_PUBLIC_POSTHOG_KEY': '"phc_zPk6jVPGyN7BhEHQ0psS02RPjh4wxmHMhvNkkXjL7mG"',
           'process.env.NEXT_PUBLIC_POSTHOG_HOST': '"https://app.posthog.com"',
           'process.turbopack': 'false',
           'process.env.NODE_ENV': '"development"',
           'process.env.NEXT_RUNTIME': '"nodejs"',
           'process.env.__NEXT_ACTIONS_DEPLOYMENT_ID': 'false',
           'process.env.NEXT_DEPLOYMENT_ID': undefined,
           'process.env.__NEXT_FETCH_CACHE_KEY_PREFIX': undefined,
           'process.env.__NEXT_PREVIEW_MODE_ID': undefined,
           'process.env.__NEXT_ALLOWED_REVALIDATE_HEADERS': undefined,
           'process.env.__NEXT_MIDDLEWARE_MATCHERS': '[]',
           'process.env.__NEXT_MANUAL_CLIENT_BASE_PATH': 'false',
           'process.env.__NEXT_NEW_LINK_BEHAVIOR': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_FILTER_ENABLED': 'true',
           'process.env.__NEXT_CLIENT_ROUTER_S_FILTER': undefined,
           'process.env.__NEXT_CLIENT_ROUTER_D_FILTER': undefined,
           'process.env.__NEXT_OPTIMISTIC_CLIENT_CACHE': 'true',
           'process.env.__NEXT_MIDDLEWARE_PREFETCH': '"flexible"',
           'process.env.__NEXT_CROSS_ORIGIN': undefined,
           'process.browser': 'false',
           'process.env.__NEXT_TEST_MODE': undefined,
           'process.env.__NEXT_TRAILING_SLASH': 'false',
           'process.env.__NEXT_BUILD_INDICATOR': 'true',
           'process.env.__NEXT_BUILD_INDICATOR_POSITION': '"bottom-right"',
           'process.env.__NEXT_STRICT_MODE': 'true',
           'process.env.__NEXT_STRICT_MODE_APP': 'true',
           'process.env.__NEXT_OPTIMIZE_FONTS': 'false',
           'process.env.__NEXT_OPTIMIZE_CSS': 'false',
           'process.env.__NEXT_SCRIPT_WORKERS': 'false',
           'process.env.__NEXT_SCROLL_RESTORATION': 'false',
           'process.env.__NEXT_IMAGE_OPTS': '{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","dangerouslyAllowSVG":false,"unoptimized":false,"domains":[],"remotePatterns":[]}',
           'process.env.__NEXT_ROUTER_BASEPATH': '""',
           'process.env.__NEXT_STRICT_NEXT_HEAD': undefined,
           'process.env.__NEXT_HAS_REWRITES': 'false',
           'process.env.__NEXT_CONFIG_OUTPUT': undefined,
           'process.env.__NEXT_I18N_SUPPORT': 'false',
           'process.env.__NEXT_I18N_DOMAINS': undefined,
           'process.env.__NEXT_ANALYTICS_ID': '""',
           'process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE': undefined,
           'process.env.__NEXT_EXTERNAL_MIDDLEWARE_REWRITE_RESOLVE': undefined,
           'process.env.__NEXT_MANUAL_TRAILING_SLASH': undefined,
           'process.env.__NEXT_HAS_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_WEB_VITALS_ATTRIBUTION': undefined,
           'process.env.__NEXT_ASSET_PREFIX': '""',
           'global.GENTLY': 'false'
         }
       },
       IgnorePlugin {
         options: { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ },
         checkIgnore: [Function: bound checkIgnore]
       },
       NextJsRequireCacheHotReloader {
         prevAssets: null,
         hasServerComponents: true
       },
       PagesManifestPlugin {
         dev: true,
         isEdgeRuntime: false,
         appDirEnabled: true
       },
       ProfilingPlugin {
         runWebpackSpan: Span {
           name: 'hot-reloader',
           parentId: undefined,
           duration: null,
           attrs: { version: '13.4.19' },
           status: 1,
           id: 1,
           _start: 4215254318416n,
           now: 1694175015121
         }
       },
       WellKnownErrorsPlugin {},
       FlightClientEntryPlugin {
         dev: true,
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         isEdgeServer: false,
         useServerActions: false,
         serverActionsBodySizeLimit: undefined,
         assetPrefix: ''
       },
       NextTypesPlugin {
         dir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web',
         distDir: '.next',
         appDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/app',
         dev: true,
         isEdgeServer: false,
         pageExtensions: [ 'tsx', 'ts', 'jsx', 'js' ],
         pagesDir: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/src/pages',
         typedRoutes: false,
         distDirAbsolutePath: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next'
       }
     ],
     experiments: { layers: true, cacheUnaffected: true, buildHttp: undefined },
     snapshot: { managedPaths: [ /^(.+?[\\/]node_modules[\\/])/ ] },
     cache: {
       type: 'filesystem',
       version: '13.4.19|{"appDir":true,"pageExtensions":["tsx","ts","jsx","js"],"trailingSlash":false,"buildActivity":true,"buildActivityPosition":"bottom-right","productionBrowserSourceMaps":false,"reactStrictMode":true,"optimizeFonts":true,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"typedRoutes":false,"basePath":"","pageEnv":false,"excludeDefaultMomentLocales":true,"assetPrefix":"","disableOptimizedLoading":true,"isEdgeRuntime":false,"reactProductionProfiling":false,"webpack":true,"hasRewrites":false,"swcMinify":true,"swcLoader":true,"removeConsole":false,"modularizeImports":{"lodash":{"transform":"lodash/{{member}}"},"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"date-fns":{"transform":"date-fns/{{member}}"},"lodash-es":{"transform":"lodash-es/{{member}}"},"lucide-react":{"transform":{"(SortAsc|LucideSortAsc|SortAscIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react","(SortDesc|LucideSortDesc|SortDescIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react","(Verified|LucideVerified|VerifiedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react","(Slash|LucideSlash|SlashIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react","(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react","(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react","(SquareGantt|LucideSquareGantt|SquareGanttIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react","(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react","(SquareKanban|LucideSquareKanban|SquareKanbanIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react","(Edit3|LucideEdit3|Edit3Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react","(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react","(Edit2|LucideEdit2|Edit2Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react","(Stars|LucideStars|StarsIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react","(TextSelection|LucideTextSelection|TextSelectionIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react","Lucide(.*)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","(.*)Icon":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","*":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react"}},"@headlessui/react":{"transform":{"Transition":"modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react","Tab":"modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react","*":"modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react"},"skipDefaultConversion":true},"@heroicons/react/20/solid":{"transform":"@heroicons/react/20/solid/esm/{{member}}"},"@heroicons/react/24/solid":{"transform":"@heroicons/react/24/solid/esm/{{member}}"},"@heroicons/react/24/outline":{"transform":"@heroicons/react/24/outline/esm/{{member}}"},"ramda":{"transform":"ramda/es/{{member}}"},"react-bootstrap":{"transform":{"useAccordionButton":"modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton","*":"react-bootstrap/{{member}}"}},"antd":{"transform":"antd/lib/{{kebabCase member}}"},"ahooks":{"transform":{"createUpdateEffect":"modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect","*":"ahooks/es/{{member}}"}},"@ant-design/icons":{"transform":{"IconProvider":"modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons","createFromIconfontCN":"@ant-design/icons/es/components/IconFont","getTwoToneColor":"modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","setTwoToneColor":"modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","*":"@ant-design/icons/lib/icons/{{member}}"}},"next/server":{"transform":"next/dist/server/web/exports/{{ kebabCase member }}"}},"legacyBrowsers":false,"imageLoaderFile":""}',
       cacheDirectory: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/.next/cache/webpack',
       compression: 'gzip',
       buildDependencies: {
         config: [
           '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/apps/web/next.config.js'
         ]
       },
       name: 'server-development'
     },
     mode: 'development',
     name: 'server',
     target: 'node16.8',
     devtool: 'eval-source-map'
   }

