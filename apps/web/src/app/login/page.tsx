import Link from 'next/link';
import {EmailBtn} from './_components/EmailBtn';
import {Providers} from './_components/Providers';
import {CredentialsBtn} from './_components/CredentialsBtn';
export default function Login() {
  return (
    <>
      <div className="flex flex-col bg-primary-dark-blue items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
        <div>
          <Link href="/" className="text-4xl text-white font-bold">
            Glyphx
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl text-white font-bold">Sign in with your email</h1>
          <h2 className="text-white">
            We&apos;ll send a magic link to your inbox to confirm your email address and sign you in.
          </h2>
        </div>
        <EmailBtn />
        <Providers />
        {!process.env.GLYPHX_ENV ? <CredentialsBtn /> : <></>}
      </div>
    </>
  );
}
