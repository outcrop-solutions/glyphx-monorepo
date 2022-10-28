import { useState } from "react";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import {userAtom } from "@/state/user";
import { useSetRecoilState } from "recoil";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const setUser = useSetRecoilState(userAtom);

  const handleSignUp = async () => {
    try {
      const user = await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
          name: fullName,
        },
      });
      setUser(user);
      // setUser({
      //   username: username,
      //   password: password,
      // });
      router.push("/home");
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log("error signing up" + error);
    }
  };
  return (
    // TODO: @Johnathan I fixed the width and centering of the form here as well as the sign in form
    <div className="flex h-full w-full items-center justify-center scrollbar-none bg-secondary-midnight pt-5">
      {/* Content */}
      {/* <div className="w-full"> */}
        <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="w-80 rounded-md p-8 bg-secondary-space-blue border-gray border-2">
            <h1 className="text-xl text-white font-bold mb-6">
              Create a new account
            </h1>
            {/* Form */}
            <div>
              <div className="space-y-4">
                <>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-white"
                      htmlFor="email"
                    >
                      Email Address <span className="text-yellow">*</span>
                    </label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      id="email"
                      className="form-input w-full bg-primary-dark-blue text-white border-gray focus:border-0"
                      type="email"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-white"
                      htmlFor="name"
                    >
                      Full Name <span className="text-yellow">*</span>
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      id="name"
                      className="form-input w-full bg-primary-dark-blue border-gray focus:border-0 text-white"
                      type="text"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      className="form-input w-full bg-primary-dark-blue border-gray text-white focus:border-0"
                      type="password"
                      autoComplete="on"
                    />
                  </div>
                </>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray">
                  Have an account?{" "}
                  <Link href="/auth/signIn">
                    <span className="font-medium text-yellow select-none cursor-pointer hover:text-yellow">
                      Sign In
                    </span>
                  </Link>
                </div>
                {/* <Link href="/auth/signup"> */}
                  <div
                    onClick={handleSignUp}
                    className="btn bg-yellow select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow text-black ml-3"
                  >
                    Sign Up
                  </div>
                {/* </Link> */}
              </div>
              {error ? (
                <div className="btn bg-yellow text-white my-4 w-full">
                  {error}
                </div>
              ) : null}
            </div>
            {/* Footer */}
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}
