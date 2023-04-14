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
import { useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import produce from 'immer';

export default function Settings() {
  const { data } = useSession();
  const setShowDeleteModal = useSetRecoilState(showModalAtom);

  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [userCode, setUserCode] = useState('');
  const validName = name?.length > 0 && name?.length <= 32;
  const validEmail = isEmail(email);
  // local state
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handleNameChange = (event) => setName(event.target.value);

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
        onSuccess: () => signOut({ callbackUrl: '/auth/login' }),
      });
    }
  };

  // open delete confirmation modal
  const toggleModal = () => {
    setShowDeleteModal(
      produce((draft) => {
        draft.type = 'deleteAccount';
      })
    );
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
          <Card.Body
            title="Danger Zone"
            subtitle="Permanently remove your Personal Account and all of its contents
              from Glyphx platform"
          />
          <Card.Footer>
            <small>This action is not reversible, so please continue with caution</small>
            <Button className="text-white bg-red-600 hover:bg-red-500" onClick={toggleModal}>
              Deactivate Personal Account
            </Button>
          </Card.Footer>
        </Card>
      </Content.Container>
    </Fragment>
  );
}
