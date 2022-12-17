import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import React from 'react';

export default function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await Auth.signIn(username, password);
      //on succfull log in
      router.push('/');
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  };
  return (
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
                value={username}
                onChange={handleUname}
                className="w-full h-8 pl-4 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="">
              <input
                data-test="sign-in-password-input"
                value={password}
                onChange={handlePass}
                id="password"
                className="w-full h-8 pl-4 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white focus:border-primary-yellow "
                type="password"
                autoComplete="on"
                placeholder="Password"
              />
            </div>

            <div className="flex flex-row justify-end mt-2 mb-4">
              <Link href={'/auth/resetPassword'}>
                <div className="font-roboto font-normal text-[10px] leading-[12px] underline hover:cursor-pointer  text-primary-yellow">
                  Forgot Password?
                </div>
              </Link>
            </div>
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
            <div data-test="sign-in-sign-in-button">
              <button
                className="font-roboto font-medium text-[14px] leading-[16px] p-2 rounded-sm text-secondary-space-blue bg-yellow hover:bg-primary-yellow-hover cursor-pointer"
                onClick={signIn}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
        {error ? (
          <div className="btn font-roboto font-medium text-[14px] leading-[16px] bg-yellow text-white my-4 w-full">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
