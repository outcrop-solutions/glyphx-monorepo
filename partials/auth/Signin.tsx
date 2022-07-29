import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import React from "react";

export const Signin = ({ setStatus }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

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
      console.log({ user });
      router.push("/home");
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
    <div className="relative md:flex">
      {/* Content */}
      <div className="w-full">
        <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="w-full rounded-md p-8 bg-slate-800 border-slate-400 border">
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
                    className="w-full bg-primary-dark-blue border-slate-400 text-white focus:border-0"
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
                    className="w-full bg-primary-dark-blue border-slate-400 focus:border-opacity-0 focus:ring-transparent text-white"
                    type="password"
                    autoComplete="on"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="mr-1">
                  <div
                    onClick={() => setStatus("reset")}
                    className="text-sm underline hover:no-underline text-slate-400"
                  >
                    Forgot Password?
                  </div>
                </div>
                <div data-test="sign-in-sign-in-button">
                  <a
                    className="btn bg-yellow-400 select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow-600 text-slate-900 ml-3"
                    onClick={signIn}
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="pt-5 mt-6 border-t border-slate-200">
              <div className="text-sm text-slate-400">
                Don’t you have an account?{" "}
                <span
                  onClick={() => setStatus("register")}
                  className="font-medium select-none text-yellow-400 cursor-pointer hover:text-yellow-300"
                >
                  Sign Up
                </span>
              </div>
            </div>
          </div>
          {error ? (
            <div className="btn bg-yellow-600 text-white my-4 w-full">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
