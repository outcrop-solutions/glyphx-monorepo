import React, { useState, Suspense, lazy } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { userSelector } from "../state";
import { useRecoilState, useSetRecoilState } from "recoil";

const Signin = dynamic(() => import("../partials").then((mod) => mod.Signin), {
  suspense: true,
});
const Signup = dynamic(() => import("../partials").then((mod) => mod.Signup), {
  suspense: true,
});
const ResetPassword = dynamic(
  () => import("../partials").then((mod) => mod.ResetPassword),
  {
    suspense: true,
  }
);
const Confirm = dynamic(
  () => import("../partials").then((mod) => mod.Confirm),
  {
    suspense: true,
  }
);

export default function Home() {
  const [status, setStatus] = useState("signin");
  const setUser = useSetRecoilState(userSelector(userData));

  return (
    <div>
      <Head>
        <title>Glyphx - The Data Studio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-secondary-dark-blue">
        <Suspense fallback={`Loading...`}>
          {status === "signin" ? <Signin setStatus={setStatus} /> : null}
        </Suspense>
        <Suspense fallback={`Loading...`}>
          {status === "register" ? (
            <Signup setStatus={setStatus} setUser={setUser} />
          ) : null}
        </Suspense>
        <Suspense fallback={`Loading...`}>
          {status === "reset" ? (
            <ResetPassword setStatus={setStatus} setUser={setUser} />
          ) : null}
        </Suspense>
        <Suspense fallback={`Loading...`}>
          {status === "confirm" ? (
            <Confirm setUser={setUser} setStatus={setStatus} />
          ) : null}
        </Suspense>
      </main>
    </div>
  );
}
