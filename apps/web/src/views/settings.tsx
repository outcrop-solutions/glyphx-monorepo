import { useState, Fragment, useEffect } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';
import { Transition, Menu } from '@headlessui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Button from 'components/Button';
import Card from 'components/Card';
import Content from 'components/Content';
import { _deactivateAccount, _updateUserName, _updateUserEmail, api } from 'lib/client';
import { useRouter } from 'next/router';
import { getUrl } from 'config/constants';
import { useUrl } from 'lib/client/hooks';

export default function Settings() {
  const { data } = useSession();
  const url = useUrl();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setModalState] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const validName = name?.length > 0 && name?.length <= 32;
  const validEmail = isEmail(email);
  const verifiedEmail = verifyEmail === email;
  // local state
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handleNameChange = (event) => setName(event.target.value);
  const handleVerifyEmailChange = (event) => setVerifyEmail(event.target.value);
  const toggleModal = () => {
    setVerifyEmail('');
    setModalState(!showModal);
  };
  const copyToClipboard = () => toast.success('Copied to clipboard!');

  // mutations
  const changeName = (event) => {
    event.preventDefault();
    api({ ..._updateUserName(name), setLoading: setSubmittingState });
  };
  const changeEmail = (event) => {
    event.preventDefault();
    const result = confirm('Are you sure you want to update your email address?');
    if (result) {
      api({
        ..._updateUserEmail(email),
        setLoading: setSubmittingState,

        onSuccess: () => setTimeout(() => signOut({ callbackUrl: '/auth/login' }), 2000),
      });
    }
  };
  const deactivateAccount = (event) => {
    event.preventDefault();
    api({
      ..._deactivateAccount(),
      setLoading: setSubmittingState,

      onSuccess: () => {
        signOut({ callbackUrl: `${url}/auth/login` });
      },
    });
  };

  useEffect(() => {
    if (data) {
      setName(data?.user?.name);
      setEmail(data?.user?.email);
      setUserCode(data?.user?.userId);
    }
  }, [data]);

  return (
    <Fragment>
      <Content.Title title="Account Settings" subtitle="Manage your profile, preferences, and account settings" />
      <Content.Divider />
      <Content.Container>
        <Card>
          <form>
            <Card.Body
              title="Your Name"
              subtitle="Please enter your full name, or a display name you are comfortable with"
            >
              <input
                className="px-3 py-2 border border-gray rounded md:w-1/2 bg-transparent"
                disabled={isSubmitting}
                onChange={handleNameChange}
                type="text"
                value={name}
              />
            </Card.Body>
            <Card.Footer>
              <small>Please use 32 characters at maximum</small>
              <Button className="" disabled={!validName || isSubmitting} onClick={changeName}>
                Save
              </Button>
            </Card.Footer>
          </form>
        </Card>
        <Card>
          <form>
            <Card.Body
              title="Email Address"
              subtitle="Please enter the email address you want to use to log in with
              Glyphx"
            >
              <input
                className="px-3 py-2 border border-gray rounded md:w-1/2 bg-transparent"
                disabled={isSubmitting}
                onChange={handleEmailChange}
                type="email"
                value={email}
              />
            </Card.Body>
            <Card.Footer>
              <small>We will email you to verify the change</small>
              <Button className="" disabled={!validEmail || isSubmitting} onClick={changeEmail}>
                Save
              </Button>
            </Card.Footer>
          </form>
        </Card>

        <Card>
          <Card.Body title="Personal Account ID" subtitle="Used when interacting with APIs">
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border text-white rounded md:w-1/2">
              <span className="overflow-x-auto">{userCode}</span>
              <CopyToClipboard onCopy={copyToClipboard} text={userCode}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>
        <Card danger>
          <Menu as="div" className="z-60">
            <Card.Body
              title="Danger Zone"
              subtitle="Permanently remove your Personal Account and all of its contents
              from Glyphx platform"
            />
            <Menu.Button as="div" className="w-full">
              <Card.Footer>
                <small>This action is not reversible, so please continue with caution</small>

                <Button className="text-white bg-red-600 hover:bg-red-500">Deactivate Personal Account</Button>
              </Card.Footer>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="relative z-60 bg-secondary-space-blue rounded w-full py-4 px-6 flex flex-col">
                <p>Your account will be deleted, along with all of its Workspace contents.</p>
                <p className="py-2 my-2 text-red-600 rounded">
                  <strong>Warning:</strong> This action is not reversible. Please be certain.
                </p>
                <div className="flex flex-col space-y-2 my-2">
                  <label className="text-sm text-gray-400">
                    Enter <strong>{data?.user?.email}</strong> to continue:
                  </label>
                  <input
                    className="px-3 py-2 border rounded bg-transparent"
                    disabled={isSubmitting}
                    onChange={handleVerifyEmailChange}
                    type="email"
                    value={verifyEmail}
                  />
                </div>
                <div className="flex flex-col items-stretch">
                  <Button
                    className="text-white bg-red-600 hover:bg-red-500"
                    disabled={!verifiedEmail || isSubmitting}
                    onClick={deactivateAccount}
                  >
                    <span>Deactivate Personal Account</span>
                  </Button>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </Card>
      </Content.Container>
    </Fragment>
  );
}
