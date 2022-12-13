import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import { userAtom } from '@/state/user';
import { useSetRecoilState } from 'recoil';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const setUser = useSetRecoilState(userAtom);

  const handleSignUp = async () => {
    try {
      const user = await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
          name: fullName,
        },
      });
      setUser(user);
      // setUser({
      //   username: username,
      //   password: password,
      // });
      router.push('/home');
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(false);
      }, 3000);
      console.log('error signing up' + error);
    }
  };
  return (
    // TODO: @Johnathan I fixed the width and centering of the form here as well as the sign in form
    <div className="flex h-full w-full items-center justify-center scrollbar-none bg-secondary-midnight pt-5">
      {/* Content */}
      <div className="w-96 min-h-56 flex flex-col justify-center px-4 py-8">
        <div className="w-80 rounded-md p-8 bg-secondary-space-blue border-gray border-2">
          <p className="font-roboto text-white font-medium text-[14px] leading-[16px] mb-6">Create a new account</p>
          {/* Form */}
          <div>
            <div className="">
              <div className="mb-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  id="email"
                  className="w-full pl-4 h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                  type="email"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="mb-2">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  id="name"
                  className="w-full pl-4 h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                  type="text"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  className="w-full pl-4 h-8 text-[12px] font-roboto font-normal leading-[14px] rounded-md bg-secondary-midnight border-gray text-white hover:cursor-pointer hover:border-white  focus:border-primary-yellow"
                  type="password"
                  autoComplete="off"
                  placeholder="Password"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="font-roboto font-normal text-[10px] leading-[12px] text-gray">
                Already have an account?&nbsp;
                <Link href="/auth/signIn">
                  <span className="ont-roboto font-normal text-[10px] leading-[12px] underline text-yellow cursor-pointer">
                    Sign In
                  </span>
                </Link>
              </div>

              <button
                onClick={handleSignUp}
                className="font-roboto font-medium text-[14px] leading-[16px] p-2 rounded-sm text-secondary-space-blue bg-yellow hover:bg-primary-yellow-hover cursor-pointer"
              >
                Sign Up
              </button>
              {/* </Link> */}
            </div>
            {error ? <div className="btn bg-yellow text-white my-4 w-full">{error}</div> : null}
          </div>
          {/* Footer */}
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
