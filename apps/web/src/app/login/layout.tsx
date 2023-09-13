import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Route} from 'next';

export const metadata: Metadata = {
  title: 'Login | Glyphx',
  description: 'Welcome to Glyphx',
};

export default async function AuthLayout({children}) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    console.log({session, auth: true});
    redirect(`/account` as Route);
  }

  return (
    <main className="relative flex flex-col items-center bg-secondary-space-blue justify-center h-screen p-10 space-y-10">
      {children}
    </main>
  );
}
