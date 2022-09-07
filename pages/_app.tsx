// import PlausibleProvider from "next-plausible";
import "styles/globals.css";
import type { AppProps } from "next/app";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing"
import { Amplify } from "aws-amplify";
import awsExports from "aws-exports";
import { RecoilRoot } from "recoil";
import { ErrorFallback } from "@/partials/errors";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
Amplify.configure({ ...awsExports, ssr: true });

// safely ignore recoil stdout warning messages
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
  warn: (...args) =>
    args[0].includes("Duplicate atom key") ? null : console.warn(...args),
}));

global.console = mutedConsole(global.console);

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {
  // Sentry.init({
  //   dsn: "https://27cc141e72614ddab6af6b29192e2c1f@o1211173.ingest.sentry.io/6349661",
  //   integrations: [new BrowserTracing()],

  return (
    <RecoilRoot>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        <Suspense fallback={<div>Loading ...</div>}>
          <Component {...pageProps} />
        </Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
