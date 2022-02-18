import React, { useState } from "react";
import { Auth } from "aws-amplify";

function Signup({ setSignUp, setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleConfirm = async () => {
    try {
      const user = await Auth.confirmSignUp(username, code);
      if (user) {
        // setUser(user)
        Auth.signIn(username, password)
          .then(() => {
            setIsLoggedIn(true);
            console.log("logged in after signup");
          })
          .catch((error) => {
            setIsLoggedIn(false);
            console.log({ error });
          });
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log("error confirming sign up", error);
    }
  };
  const handleSignUp = async () => {
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
          name: fullName,
        },
      });
      setConfirm(true);
      console.log({ userSignup: user });
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log("error signing up" + error);
    }
  };
  return (
    <main className="bg-primary-dark-blue">
      <div className="relative md:flex">
        {/* Content */}
        <div className="w-full">
          <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
            <div className="w-full rounded-md p-8 bg-gray-800 border-gray-400 border">
              <h1 className="text-xl text-white font-bold mb-6">
                Create a new account
              </h1>
              {/* Form */}
              <div>
                <div className="space-y-4">
                  {confirm ? (
                    <div>
                      {" "}
                      <label
                        className="block text-sm font-medium mb-1 text-white"
                        htmlFor="email"
                      >
                        Verification Code{" "}
                        <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        id="email"
                        className="form-input w-full bg-primary-dark-blue text-white border-gray-400 focus:border-0"
                        type="email"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-white"
                          htmlFor="email"
                        >
                          Email Address{" "}
                          <span className="text-yellow-500">*</span>
                        </label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          id="email"
                          className="form-input w-full bg-primary-dark-blue text-white border-gray-400 focus:border-0"
                          type="email"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-white"
                          htmlFor="name"
                        >
                          Full Name <span className="text-yellow-500">*</span>
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          id="name"
                          className="form-input w-full bg-primary-dark-blue border-gray-400 focus:border-0 text-white"
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
                          className="form-input w-full bg-primary-dark-blue border-gray-400 text-white focus:border-0"
                          type="password"
                          autoComplete="on"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Have an account?{" "}
                    <span
                      className="font-medium text-yellow-400 select-none cursor-pointer hover:text-yellow-300"
                      onClick={() => setSignUp(false)}
                    >
                      Sign In
                    </span>
                  </div>
                  {confirm ? (
                    <div
                      onClick={handleConfirm}
                      className="btn bg-yellow-400 hover:bg-yellow-600 select-none cursor-pointer text-gray-900 ml-3 whitespace-nowrap rounded-2xl py-1 font-bold text-xs"
                    >
                      Confirm
                    </div>
                  ) : (
                    <div
                      onClick={handleSignUp}
                      className="btn bg-yellow-400 hover:bg-yellow-600 select-none cursor-pointer text-gray-900 ml-3 whitespace-nowrap rounded-2xl py-1 font-bold text-xs"
                    >
                      Sign Up
                    </div>
                  )}
                </div>
                {error ? (
                  <div className="btn bg-yellow-600 text-white my-4 w-full">
                    {error}
                  </div>
                ) : null}
              </div>
              {/* Footer */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signup;
