'use client';
import {useState, Fragment, useEffect, SetStateAction, startTransition} from 'react';
import {DocumentDuplicateIcon} from '@heroicons/react/outline';
import {useSession} from 'next-auth/react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import {useSetRecoilState} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import Button from 'app/_components/Button';
import Card from 'app/_components/Card';
import Content from 'app/_components/Content';
import {modalsAtom} from 'state';
import {updateUserEmail, updateUserName} from 'actions';

export default function Settings() {
  const {data} = useSession();
  const [email, setEmail] = useState(' ');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [userCode, setUserCode] = useState('');
  const setModals = useSetRecoilState(modalsAtom);
  const validName = name?.length > 0 && name?.length <= 32;
  // local state
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handleNameChange = (event) => setName(event.target.value);

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  // open delete confirmation modal
  const toggleModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_ACCOUNT,
          isSubmitting: false,
          data: {},
        });
      })
    );
  };

  useEffect(() => {
    if (data) {
      setName(data?.user?.name as SetStateAction<string>);
      setEmail(data?.user?.email as SetStateAction<string>);
      setUserCode(data?.user?.id as SetStateAction<string>);
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
              <Button
                className=""
                disabled={!validName || isSubmitting}
                onClick={() =>
                  startTransition(() => {
                    updateUserName(name);
                  })
                }
              >
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
              <Button
                className=""
                disabled={isSubmitting}
                onClick={() =>
                  startTransition(() => {
                    updateUserEmail(email);
                  })
                }
              >
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
