'use client';
import React, {useState} from 'react';
import {signIn, useSession} from 'next-auth/react';
import toast from 'react-hot-toast';
import {useRecoilState} from 'recoil';
import {authEmailAtom} from 'state';
import {useRouter} from 'next/navigation';

export const EmailBtn = () => {
  const {status} = useSession();
  const router = useRouter();
  const [email, setEmail] = useRecoilState(authEmailAtom);
  const [isSubmitting, setSubmittingState] = useState(false);
  const handleEmailChange = (event) => setEmail(event.target.value);

  const signInWithEmail = async (event) => {
    event.preventDefault();
    setSubmittingState(true);
    const response = await signIn('email', {email, redirect: true});

    if (response?.error === null) {
      toast.success(`Please check your email (${email}) for the login link.`, {
        duration: 5000,
      });
      setEmail('');
    }
  };

  return (
    <form className="flex flex-col w-full space-y-3">
      <input
        className="px-3 py-2 border border-gray rounded bg-transparent text-white"
        onChange={handleEmailChange}
        placeholder="user@email.com"
        type="email"
        value={email}
      />
      <button
        className="py-2 bg-yellow rounded hover:bg-primary-yellow disabled:opacity-75"
        disabled={status === 'loading' || isSubmitting}
        onClick={signInWithEmail}
      >
        {status === 'loading' ? 'Checking session...' : isSubmitting ? 'Sending the link...' : 'Send the Magic Link'}
      </button>
    </form>
  );
};
