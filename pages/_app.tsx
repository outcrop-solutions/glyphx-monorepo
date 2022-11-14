import "styles/globals.css";
import type { AppProps } from "next/app";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing"
import { Amplify } from "aws-amplify";
import awsExports from "aws-exports";
import { RecoilRoot } from "recoil";
import { ErrorFallback } from "@/partials/fallback";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import BarLoader from "react-spinners/BarLoader";
import { useRouter } from "next/router";
import {useEffect} from "react";
Amplify.configure({ ...awsExports, ssr: true });

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
  warn: (...args) =>
    args[0].includes("Duplicate atom key") ? null : console.warn(...args),
}));
global.console = mutedConsole(global.console);

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {

  /* 
    TO ENABLE SENTRY (ERROR LOGGING) WHEN THIS BRANCH GOES LIVE, 
    MAKE SURE TO DISABLE PREVIOUS BRANCH IF IT IS STILL HOSTED
  */

  // Sentry.init({
  //   dsn: "https://27cc141e72614ddab6af6b29192e2c1f@o1211173.ingest.sentry.io/6349661",
  //   integrations: [new BrowserTracing()],
  // });

  const { query } = useRouter();
  const { projectId } = query;

  useEffect(()=>{
    console.log({projectId})
  },[])

  return (
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
        <Suspense fallback={
        <div className="flex flex-col justify-center items-center h-[100vh] bg-secondary-midnight">
        <p className="text-white text-2xl font-roboto font-light p-2">Loading {projectId}...</p>
          <BarLoader
            color="#FFD959"
            height={10}
            width={300}
          />
        </div>
        }>
          <Component {...pageProps} />
          
        </Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
