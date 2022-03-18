import { useState } from "react";
import { Auth } from "aws-amplify";

function ResetPassword({ setResetPass, setSignUp, setUser }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleCode = (e) => {
    setCode(e.target.value);
  };
  const handleNewPass = (e) => {
    setNewPass(e.target.value);
  };
  const handleResetPassword = async () => {
    try {
      const data = await Auth.forgotPassword(email);
      setIsCodeSent(true);

    } catch (error) {
      console.log({ error });
    }
  };
  const handleSubmitCode = async () => {
    try {
      const data = await Auth.forgotPasswordSubmit(email, code, newPass);
      setSignUp(false);
      setResetPass(false);

    } catch (error) {
      console.log({ error });
    }
  };

  const handleBack = () => {
    setResetPass(false);
    setSignUp(false);
  };

  return (
    <main className="bg-primary-dark-blue">
      <div className="relative md:flex">
        {/* Content */}
        <div className="w-full">
          <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
            {isCodeSent ? (
              <div className="w-full rounded-md p-8 bg-gray-800">
                <h1 className="text-xl text-white font-bold mb-6">
                  Confirm verification code
                </h1>
                {/* Form */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white font-medium mb-1">
                        Verification code{" "}
                        <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        id="code"
                        value={code}
                        onChange={handleCode}
                        className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray-400 focus:border-0"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white font-medium mb-1">
                        New Password <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        id="password"
                        value={newPass}
                        onChange={handleNewPass}
                        className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray-400 focus:border-0"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <span
                      onClick={handleResetPassword}
                      className="text-yellow-400 text-sm cursor-pointer hover:underline"
                    >
                      Resend code
                    </span>
                    <button
                      onClick={handleSubmitCode}
                      className="btn bg-yellow-400 hover:bg-yellow-600 text-gray-900 text-sm font-bold whitespace-nowrap rounded-2xl py-1 "
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-md p-8 bg-gray-800">
                <h1 className="text-xl text-white font-bold mb-6">
                  Reset your Password
                </h1>
                {/* Form */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm text-white font-medium mb-1"
                        htmlFor="email"
                      >
                        Email Address <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        id="email"
                        value={email}
                        onChange={handleEmail}
                        className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray-400 focus:border-0"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <span
                      onClick={handleBack}
                      className="text-yellow-400 text-sm cursor-pointer hover:underline"
                    >
                      Back to Sign In
                    </span>
                    <button
                      onClick={handleResetPassword}
                      className="btn bg-yellow-400 hover:bg-yellow-600 text-gray-900 text-sm font-bold whitespace-nowrap rounded-2xl py-1 "
                    >
                      Send Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
