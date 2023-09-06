'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {Route} from 'next';

const AuthLayout = ({children}) => {
  const router = useRouter();
  const {data} = useSession();

  useEffect(() => {
    if (data) {
      router.push('/account' as Route);
    }
  }, [data, router]);

  return (
    <main className="relative flex flex-col items-center bg-secondary-space-blue justify-center h-screen p-10 space-y-10">
      {children}
    </main>
  );
};

export default AuthLayout;