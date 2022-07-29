import { useState } from "react";
import Head from "next/head";

import { Signin, ResetPassword, Signup, Confirm } from "partials";

export default function Home() {
  const [status, setStatus] = useState("signin");
  const [user, setUser] = useState(null);

  return (
    <div>
      <Head>
        <title>Glyphx - The Data Studio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-secondary-dark-blue">
        {status === "signin" ? <Signin setStatus={setStatus} /> : null}
        {status === "register" ? (
          <Signup setStatus={setStatus} setUser={setUser} />
        ) : null}
        {status === "reset" ? (
          <ResetPassword setStatus={setStatus} setUser={setUser} />
        ) : null}
        {status === "confirm" ? (
          <Confirm setUser={setUser} setStatus={setStatus} user={user} />
        ) : null}
      </main>
    </div>
  );
}
