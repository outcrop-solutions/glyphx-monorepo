import { useState } from "react";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import {userAtom } from "@/state/user";
import { useRecoilState } from "recoil";

// default for clean dynamic import
export default function Confirm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const [user, setUser] = useRecoilState(userAtom);

  const handleConfirm = async () => {
    try {
      // @ts-ignore
      await Auth.confirmSignUp(user.username, code);
      // @ts-ignore
      await Auth.signIn(user.username, user.password);
      setUser(null);

      router.push("/home");
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log("error confirming sign up", error);
    }
  };
  return (
    <div className="relative md:flex">
      {/* Content */}
      <div className="w-full">
        <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="w-full rounded-md p-8 bg-gray border-gray border">
            <h1 className="text-xl text-white font-bold mb-6">
              Create a new account
            </h1>
            {/* Form */}
            <div>
              <div className="space-y-4">
                <div>
                  {" "}
                  <label
                    className="block text-sm font-medium mb-1 text-white"
                    htmlFor="email"
                  >
                    Verification Code <span className="text-yellow">*</span>
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    id="email"
                    className="form-input w-full bg-primary-dark-blue text-white border-gray focus:border-0"
                    type="email"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray">
                  Have an account?{" "}
                  <span
                    className="font-medium text-yellow select-none cursor-pointer hover:text-yellow"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Sign In
                  </span>
                </div>
                <div
                  onClick={handleConfirm}
                  className="btn bg-yellow hover:bg-yellow select-none cursor-pointer text-gray ml-3 whitespace-nowrap rounded-2xl py-1 font-bold text-xs"
                >
                  Confirm
                </div>
              </div>
              {error ? (
                <div className="btn bg-yellow text-white my-4 w-full">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
