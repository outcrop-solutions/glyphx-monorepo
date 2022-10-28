import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import React from "react";
import { userAtom } from "@/state/user";
import { useSetRecoilState } from "recoil";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const setUser = useSetRecoilState(userAtom);

  const router = useRouter();
  const handleUname = (e) => {
    setUsername(e.target.value);
  };

  const handlePass = (e) => {
    setPassword(e.target.value);
  };
  const signIn = async () => {
    try {
      const user = await Auth.signIn(username, password);
      setUser(user);
      console.log({ user });
      router.push("/");
      // setUser(user);
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log("error on signin page" + error);
      // setIsLoggedIn(false);
    }
  };
  return (
    // TODO: @Johnathan I fixed the width and centering of the form here
    <div className="flex h-full items-center justify-center w-full scrollbar-none bg-secondary-midnight pt-5">
      {/* Content */}
      {/* <div className=""> */}
      <div className="flex flex-col justify-center px-4 py-8">
        <div className="rounded-md p-8 bg-secondary-space-blue border-gray border-2">
          <h1 className="text-xl text-white font-bold mb-6">
            Sign in to your account
          </h1>
          {/* Form */}
          <div
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                signIn();
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-white"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  data-test="username-input"
                  value={username}
                  onChange={handleUname}
                  className="w-full bg-primary-dark-blue border-gray text-white focus:border-0"
                  type="email"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-white"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  data-test="sign-in-password-input"
                  value={password}
                  onChange={handlePass}
                  id="password"
                  className="w-full bg-primary-dark-blue border-gray focus:border-opacity-0 focus:ring-transparent text-white"
                  type="password"
                  autoComplete="on"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="mr-1">
                <Link href={"/auth/resetPassword"}>
                  <div className="text-sm underline hover:no-underline text-gray">
                    Forgot Password?
                  </div>
                </Link>
              </div>
              <div data-test="sign-in-sign-in-button">
                <a
                  className="btn bg-yellow select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow text-black ml-3"
                  onClick={signIn}
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="pt-5 mt-6 border-t border-gray">
            <div className="text-sm text-gray">
              Don’t you have an account?{" "}
              <Link href="/auth/signUp">
                <span className="font-medium select-none text-yellow cursor-pointer hover:text-yellow">
                  Sign Up
                </span>
              </Link>
            </div>
          </div>
        </div>
        {error ? (
          <div className="btn bg-yellow text-white my-4 w-full">{error}</div>
        ) : null}
      </div>
      {/* </div> */}
    </div>
  );
}
