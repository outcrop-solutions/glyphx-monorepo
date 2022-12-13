import { useEffect } from 'react';
import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing"
import { Amplify } from 'aws-amplify';
import awsExports from 'aws-exports';
import { RecoilRoot } from 'recoil';
import { ErrorFallback } from '@/partials/fallback';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

import { SuspenseFallback } from '@/partials/fallback';
Amplify.configure({ ...awsExports, ssr: true });
// To safely ignore recoil stdout warning messages
// Detailed here : https://github.com/facebookexperimental/Recoil/issues/733
// const memoize = (fn) => {
//   let cache = {};
//   return (...args) => {
//     let n = args[0];
//     if (n in cache) {
//       return cache[n];
//     } else {
//       let result = fn(n);
//       cache[n] = result;
//       return result;
//     }
//   };
// };
// ignore in-browser next/js recoil warnings until its fixed.
// const mutedConsole = memoize((console) => ({
//   ...console,
//   warn: (...args) => (args[0].includes('Duplicate atom key') ? null : console.warn(...args)),
// }));
// global.console = mutedConsole(global.console);

// NEXT-AUTH version
// export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
  /* 
    TO ENABLE SENTRY (ERROR LOGGING) WHEN THIS BRANCH GOES LIVE, 
    MAKE SURE TO DISABLE PREVIOUS BRANCH IF IT IS STILL HOSTED
  */

  // Sentry.init({
  //   dsn: "https://27cc141e72614ddab6af6b29192e2c1f@o1211173.ingest.sentry.io/6349661",
  //   integrations: [new BrowserTracing()],
  // });

  return (
    // <SessionProvider session={session}>
    <RecoilRoot>
      {/* Root Fallback for when error is throws */}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        {/* Root Fallback for when data is loading */}
        <Suspense fallback={<SuspenseFallback />}>
          <Component {...pageProps} />
        </Suspense>
      </ErrorBoundary>
    </RecoilRoot>
    // </SessionProvider>
  );
}
