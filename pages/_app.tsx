// import PlausibleProvider from "next-plausible";
import "styles/globals.css";
import type { AppProps } from "next/app";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing"
import { Amplify } from "aws-amplify";
import awsExports from "aws-exports";
import { RecoilRoot } from "recoil";
Amplify.configure({ ...awsExports, ssr: true });

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {
  // Sentry.init({
  //   dsn: "https://27cc141e72614ddab6af6b29192e2c1f@o1211173.ingest.sentry.io/6349661",
  //   integrations: [new BrowserTracing()],

  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
