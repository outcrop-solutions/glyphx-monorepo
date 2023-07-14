import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProviders, signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';
import { useRouter } from 'next/router';

const Login = () => {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [socialProviders, setSocialProviders] = useState([]);
  const validate = isEmail(email);

  const handleEmailChange = (event) => setEmail(event.target.value);

  const signInWithEmail = async (event) => {
    event.preventDefault();
    setSubmittingState(true);
    const response = await signIn('email', { email, redirect: true });

    if (response.error === null) {
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
  const signInWithCreds = async () => {
    router.push('/account');
  };

  useEffect(() => {
    (async () => {
      const socialProviders = [];
      const { email, ...providers } = await getProviders();
      for (const provider in providers) {
        socialProviders.push(providers[provider]);
      }
      setSocialProviders([...socialProviders]);
    })();
  }, []);

  return (
    <>
      <div className="flex flex-col bg-primary-dark-blue items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
        <div>
          <Link href="/">
            <a className="text-4xl text-white font-bold">Glyphx</a>
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
                    if (provider.name === 'Credentials') {
                      signInWithCreds();
                    } else {
                      signInWithSocial(provider.id);
                    }
                  }}
                >
                  {provider.name === 'Credentials' ? 'Dev Mode Sign In' : provider.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Login;