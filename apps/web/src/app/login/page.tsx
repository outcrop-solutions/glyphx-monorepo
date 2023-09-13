'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ClientSafeProvider, getProviders, signIn, useSession} from 'next-auth/react';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';
import {useRouter} from 'next/navigation';

export default function Login() {
  const {status} = useSession();
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [socialProviders, setSocialProviders] = useState([] as ClientSafeProvider[]);
  const validate = isEmail(email);

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

    setSubmittingState(false);
  };

  const signInWithSocial = (socialId) => {
    signIn(socialId);
  };

  useEffect(() => {
    if (session?.status === 'unauthenticated') {
      console.dir({session}, {depth: null});
      // router.push('/account' as Route);
    }
  }, [router, session]);

  useEffect(() => {
    (async () => {
      const socialProviders = [] as ClientSafeProvider[];
      const providers = await getProviders();
      if (providers) {
        // extract email provider to handle differently
        const {email, ...rest} = providers;
        for (const provider in rest) {
          socialProviders.push(providers[provider]);
        }
        setSocialProviders([...socialProviders]);
      }
    })();
  }, []);

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
            disabled={status === 'loading' || !validate || isSubmitting}
            onClick={signInWithEmail}
          >
            {status === 'loading'
              ? 'Checking session...'
              : isSubmitting
              ? 'Sending the link...'
              : 'Send the Magic Link'}
          </button>
        </form>
        {socialProviders?.length > 0 && (
          <>
            <span className="text-sm text-white">or sign in with</span>
            <div className="flex flex-col w-full space-y-3">
              {socialProviders.map((provider, index) => (
                <button
                  key={index}
                  className="py-2 bg-secondary-midnight border rounded hover:bg-gray-50 disabled:opacity-75 text-white"
                  disabled={status === 'loading'}
                  onClick={() => {
                    signInWithSocial(provider.id);
                  }}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
