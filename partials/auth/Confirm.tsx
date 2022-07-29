import { useState } from "react";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";

export const Confirm = ({ user, setUser, setStatus }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      await Auth.confirmSignUp(user.username, code);

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
          <div className="w-full rounded-md p-8 bg-slate-800 border-slate-400 border">
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
                    Verification Code <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    id="email"
                    className="form-input w-full bg-primary-dark-blue text-white border-slate-400 focus:border-0"
                    type="email"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-400">
                  Have an account?{" "}
                  <span
                    className="font-medium text-yellow-400 select-none cursor-pointer hover:text-yellow-300"
                    onClick={() => setStatus("signin")}
                  >
                    Sign In
                  </span>
                </div>
                <div
                  onClick={handleConfirm}
                  className="btn bg-yellow-400 hover:bg-yellow-600 select-none cursor-pointer text-slate-900 ml-3 whitespace-nowrap rounded-2xl py-1 font-bold text-xs"
                >
                  Confirm
                </div>
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
  );
};
