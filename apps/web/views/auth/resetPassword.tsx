import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import Link from 'next/link';

// default for clean dynamic import
export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

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
      const result = await Auth.forgotPasswordSubmit(email, code, newPass);
      console.log({ result });
      if (result === 'SUCCESS') {
        // if successfull navigate to sign in
        router.push('/auth/signIn');
      }
    } catch (error) {
      console.log({ error });
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage(false);
      }, 5000);
    }
  };

  const handleBack = () => {
    router.push('/auth/signIn');
  };

  return (
    <div className="flex h-full items-center justify-center w-full scrollbar-none bg-secondary-midnight">
      <div className="flex flex-col justify-center px-4 py-8 w-96 min-h-56">
        <div className="rounded-md p-8 bg-secondary-space-blue border-gray border">
          {isCodeSent ? (
            <>
              <p className="font-roboto text-white font-medium text-[14px] leading-[16px] mb-6">
                Confirm verification code.
              </p>
              <div
                onKeyPress={(ev) => {
                  if (ev.key === 'Enter') {
                    ev.preventDefault();
                    handleSubmitCode();
                  }
                }}
              >
                <div className="mb-2">
                  <input
                    id="code"
                    data-test="username-input"
                    value={code}
                    onChange={handleCode}
                    className="w-full h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                    type="number"
                    placeholder="Verification Code"
                    required
                  />
                </div>

                <div className="mb-4">
                  <input
                    data-test="sign-in-password-input"
                    value={newPass}
                    onChange={handleNewPass}
                    id="password"
                    className="w-full h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white focus:border-primary-yellow "
                    type="password"
                    autoComplete="off"
                    placeholder="Reset Password"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-row items-center justify-between">
                <p className="font-roboto font-normal text-[14px] leading-[16px] text-yellow cursor-pointer">
                  Resend Code
                </p>
                <div>
                  <button
                    className="font-roboto font-medium text-[14px] leading-[16px] p-2 rounded-sm text-secondary-space-blue bg-yellow hover:bg-primary-yellow-hover cursor-pointer"
                    onClick={handleSubmitCode}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-roboto text-white font-medium text-[14px] leading-[16px] mb-6">Reset your password.</p>
              <div
                onKeyPress={(ev) => {
                  if (ev.key === 'Enter') {
                    ev.preventDefault();
                    handleResetPassword();
                  }
                }}
              >
                <div className="mb-4">
                  <input
                    id="email"
                    data-test="username-input"
                    value={email}
                    onChange={handleEmail}
                    className="w-full h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                    type="email"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <Link href="/auth/signIn">
                  <div className="flex flex-row items-center justify-center hover:cursor-pointer font-roboto font-medium text-[14px] leading-[16px] text-light-gray">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M14.71 15.88L10.83 12L14.71 8.11998C15.1 7.72998 15.1 7.09998 14.71 6.70998C14.32 6.31998 13.69 6.31998 13.3 6.70998L8.71 11.3C8.32 11.69 8.32 12.32 8.71 12.71L13.3 17.3C13.69 17.69 14.32 17.69 14.71 17.3C15.09 16.91 15.1 16.27 14.71 15.88Z"
                        fill="#CECECE"
                      />
                    </svg>

                    <p>Back</p>
                  </div>
                </Link>
                <div>
                  <button
                    className="font-roboto font-medium text-[14px] leading-[16px] p-2 rounded-sm text-secondary-space-blue bg-yellow hover:bg-primary-yellow-hover cursor-pointer"
                    onClick={handleResetPassword}
                  >
                    Send Code
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        {errorMessage ? (
          <div className="btn font-roboto font-medium text-[14px] leading-[16px] bg-yellow text-white my-4 w-full">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );

  // return (
  //   <main className="bg-primary-dark-blue">
  //     <div className="relative md:flex">
  //       {/* Content */}
  //       <div className="w-full">
  //         <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8">
  //           {isCodeSent ? (
  //             <div className="w-full rounded-md p-8 bg-gray">
  //               <h1 className="text-xl text-white font-bold mb-6">
  //                 Confirm verification code
  //               </h1>
  //               {/* Form */}
  //               <div>
  //                 <div className="space-y-4">
  //                   <div>
  //                     <label className="block text-sm text-white font-medium mb-1">
  //                       Verification code <span className="text-yellow">*</span>
  //                     </label>
  //                     <input
  //                       id="code"
  //                       value={code}
  //                       onChange={handleCode}
  //                       className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray focus:border-0"
  //                       type="number"
  //                     />
  //                   </div>
  //                   <div>
  //                     <label className="block text-sm text-white font-medium mb-1">
  //                       New Password <span className="text-yellow">*</span>
  //                     </label>
  //                     <input
  //                       id="password"
  //                       value={newPass}
  //                       onChange={handleNewPass}
  //                       className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray focus:border-0"
  //                       type="password"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="flex justify-between mt-6">
  //                   <span
  //                     onClick={handleResetPassword}
  //                     className="text-yellow text-sm cursor-pointer hover:underline"
  //                   >
  //                     Resend code
  //                   </span>
  //                   <button
  //                     onClick={handleSubmitCode}
  //                     className="btn bg-yellow hover:bg-yellow text-gray text-sm font-bold whitespace-nowrap rounded-2xl py-1 "
  //                   >
  //                     Submit
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //           ) : (
  //             <div className="w-full rounded-md p-8 bg-gray">
  //               <h1 className="text-xl text-white font-bold mb-6">
  //                 Reset your Password
  //               </h1>
  //               {/* Form */}
  //               <div>
  //                 <div className="space-y-4">
  //                   <div>
  //                     <label
  //                       className="block text-sm text-white font-medium mb-1"
  //                       htmlFor="email"
  //                     >
  //                       Email Address <span className="text-yellow">*</span>
  //                     </label>
  //                     <input
  //                       id="email"
  //                       value={email}
  //                       onChange={handleEmail}
  //                       className="form-input w-full bg-primary-dark-blue focus:bg-primary-dark-blue border-gray focus:border-0"
  //                       type="email"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="flex justify-between mt-6">
  //                   <span
  //                     onClick={handleBack}
  //                     className="text-yellow text-sm cursor-pointer hover:underline"
  //                   >
  //                     Back to Sign In
  //                   </span>
  //                   <button
  //                     onClick={handleResetPassword}
  //                     className="btn bg-yellow hover:bg-yellow text-gray text-sm font-bold whitespace-nowrap rounded-2xl py-1 "
  //                   >
  //                     Send Code
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </main>
  // );
}
