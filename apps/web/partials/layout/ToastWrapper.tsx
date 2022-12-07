import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { errorMessageAtom, updateMessageAtom } from '../states/app';

export const ToastWrapper = ({ children }) => {
  const router = useRouter();
  const error = useRecoilValue(errorMessageAtom);
  const update = useRecoilValue(updateMessageAtom);
  useEffect(() => {
    if (error) {
      toast.error(String(error));
    }
    if (update) {
      toast.success(String(update));
    }
  }, [error, update]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
        }}
      />
      {children}
    </>
  );
};
