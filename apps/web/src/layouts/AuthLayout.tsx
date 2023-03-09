import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      router.push('/account');
    }
  }, [data, router]);

  return (
    <main className="relative flex flex-col items-center bg-secondary-midnight justify-center h-screen p-10 space-y-10">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      {children}
    </main>
  );
};

export default AuthLayout;
