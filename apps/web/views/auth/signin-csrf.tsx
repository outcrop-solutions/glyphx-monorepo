import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRedirectAuth } from 'lib';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { setTimeout } from 'timers';

export const Signin = ({ referer }) => {
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loginEmailSent, setLoginEmailSent] = useState(false);

  // Get error message added by next/auth in URL.
  const { query } = useRouter();
  const { error } = query;

  const [email, setEmail] = useState('');

  useEffect(() => {
    console.log({ error });
    const errorMessage = Array.isArray(error) ? error.pop() : error;
    errorMessage && toast.error(errorMessage);
  }, [error]);

  // useRedirectAuth();
  return (
    // TODO: @Johnathan I fixed the width and centering of the form here
    <div className="flex h-full items-center justify-center w-full scrollbar-none bg-secondary-midnight">
      {/* Content */}
      <div className="flex flex-col justify-center px-4 py-8 w-96 min-h-56">
        <div className="rounded-md p-8 bg-secondary-space-blue border-gray border">
          <p className="font-roboto text-white font-medium text-[14px] leading-[16px] mb-6">Log in to your account.</p>
          {/* Form */}
          <div
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                ev.preventDefault();
                signIn();
              }
            }}
          >
            <div className="mb-2">
              <input
                id="email"
                data-test="username-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                type="email"
                placeholder="Email"
              />
            </div>

            {/* <div className="flex flex-row justify-end mt-2 mb-4">
              <Link href={'/auth/resetPassword'}>
                <div className="font-roboto font-normal text-[10px] leading-[12px] underline hover:cursor-pointer  text-primary-yellow">
                  Forgot Password?
                </div>
              </Link>
            </div> */}
          </div>

          {/* Footer */}
          <div className="flex flex-row items-center justify-between">
            <div className="font-roboto font-normal text-[10px] leading-[12px] text-gray">
              Have an account?&nbsp;
              <Link href="/auth/signUp">
                <span className="font-roboto font-normal text-[10px] leading-[12px] underline text-yellow cursor-pointer">
                  Sign Up
                </span>
              </Link>
            </div>
            <div
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 5000);
                signIn('email', {
                  email: email,
                  callbackUrl: referer,
                  // if invite, pull id out of invite link to reroute to content
                  // callbackUrl: referer.includes('invite') ? `/invite/${referer.split('/')[2]}` : referer,
                });
              }}
              data-test="sign-in-sign-in-button"
            >
              <button className="font-roboto font-medium text-[14px] leading-[16px] p-2 rounded-sm text-secondary-space-blue bg-yellow hover:bg-primary-yellow-hover cursor-pointer">
                Log In
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="btn font-roboto font-medium text-[14px] leading-[16px] bg-yellow text-white my-4 w-full">
            Check your inbox for a magic link!
            <br /> Didn't receive your link? Try Again.
          </div>
        ) : null}
      </div>
      {/* </div> */}
    </div>
  );
};
