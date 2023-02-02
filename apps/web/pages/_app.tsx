<<<<<<< HEAD
=======
import 'styles/globals.css';
import { useEffect, useState } from 'react';
>>>>>>> feature/new-filesystem-merge-commit
import type { AppProps } from 'next/app';
import Router, { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
<<<<<<< HEAD
import 'styles/globals.css';
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing"
import { Amplify } from 'aws-amplify';
import awsExports from 'aws-exports';
=======
import { ThemeProvider } from 'next-themes';
import ReactGA from 'react-ga';
import TopBarProgress from 'react-topbar-progress-indicator';
import { SWRConfig } from 'swr';

import progressBarConfig from 'config/progress-bar/index';
import swrConfig from 'config/swr/index';
import WorkspaceProvider from 'providers/workspace';

>>>>>>> feature/new-filesystem-merge-commit
import { RecoilRoot } from 'recoil';
import { ErrorFallback } from 'partials/fallback';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

<<<<<<< HEAD
import { SuspenseFallback } from 'partials/fallback';
Amplify.configure({ ...awsExports, ssr: true });

=======
import { SuspenseFallback } from '@/partials/fallback';
>>>>>>> feature/new-filesystem-merge-commit
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

// NEXT-AUTH ENABLED VERSION
// export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {

export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
  const [progress, setProgress] = useState(false);
  const router = useRouter();
  const swrOptions = swrConfig();
  Router.events.on('routeChangeStart', () => setProgress(true));
  Router.events.on('routeChangeComplete', () => setProgress(false));
  TopBarProgress.config(progressBarConfig());
  /* 
    TO ENABLE SENTRY (ERROR LOGGING) WHEN THIS BRANCH GOES LIVE, 
    MAKE SURE TO DISABLE PREVIOUS BRANCH IF IT IS STILL HOSTED
  */
  // Sentry.init({
  //   dsn: "https://27cc141e72614ddab6af6b29192e2c1f@o1211173.ingest.sentry.io/6349661",
  //   integrations: [new BrowserTracing()],
  // });
  useEffect(() => {
    const handleRouteChange = (url) => {
      ReactGA.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
<<<<<<< HEAD
    // UNCOMMENT TO ENABLE NEXT-AUTH
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
=======
    // @ts-ignore
    <SessionProvider session={pageProps.session}>
      <SWRConfig value={swrOptions}>
        <ThemeProvider attribute="class">
          {/* @ts-ignore */}
          <WorkspaceProvider>
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
                  {progress && <TopBarProgress />}
                  <Component {...pageProps} />
                </Suspense>
              </ErrorBoundary>
            </RecoilRoot>
          </WorkspaceProvider>
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
>>>>>>> feature/new-filesystem-merge-commit
    // </SessionProvider>
  );
}
