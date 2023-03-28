// RESPONSIBLE FOR PROVIDING GLOBAL STATE MANAGEMENT, DATA FETCHING CONFIGURATION, ERROR TRAPPING ANDUSER SESSION INFO TO ALL PAGES

import 'styles/globals.css';
import { useEffect, useState, Suspense } from 'react';
import type { AppProps } from 'next/app';
import { Session } from 'next-auth';
import Router from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading Bar
import TopBarProgress from 'react-topbar-progress-indicator';
import progressBarConfig from 'config/progress-bar/index';

// Data Fetching
import { SWRConfig } from 'swr';
import swrConfig from 'config/swr/index';

// State Management
import { RecoilRoot } from 'recoil';
import WorkspaceProvider from 'providers/workspace';

// Partials
import { ErrorFallback } from 'partials/fallback';
import { SuspenseFallback } from 'partials/fallback';

declare global {
  interface Window {
    core: any | undefined;
  }
}

// To safely ignore recoil stdout warning messages
// Detailed here : https://github.com/facebookexperimental/Recoil/issues/733
const memoize = (fn) => {
  let cache = {};
  return (...args) => {
    let n = args[0];
    if (n in cache) {
      return cache[n];
    } else {
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};
// ignore in-browser next/js recoil warnings until its fixed.
const mutedConsole = memoize((console) => ({
  ...console,
  warn: (...args) => (args[0].includes('Duplicate atom key') ? null : console.warn(...args)),
}));
global.console = mutedConsole(global.console);

// NEXT-AUTH ENABLED VERSION
export default function App({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  const [progress, setProgress] = useState(false);
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
    window.core = window.core || {};
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig value={swrOptions}>
        <WorkspaceProvider>
          <RecoilRoot>
            {/* Root Fallback for when error is throws */}
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
              {/* Root Fallback for when data is loading */}
              <Suspense fallback={<SuspenseFallback />}>
                {progress && <TopBarProgress />}
                <Component {...pageProps} />
              </Suspense>
            </ErrorBoundary>
          </RecoilRoot>
        </WorkspaceProvider>
      </SWRConfig>
    </SessionProvider>
  );
}
