import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

import Card from 'components/Card/index';
import Button from 'components/Button';
import { _joinWorkspace, api } from 'lib';
import { workspaceService, Initializer } from '@glyphx/business';

const Invite = ({ workspace }) => {
  const { data } = useSession();
  const router = useRouter();
  const [isSubmitting, setSubmittingState] = useState(false);

  const join = () => {
    api({
      ..._joinWorkspace(workspace.workspaceCode),
      setLoading: setSubmittingState,
      onError: (status) => {
        if (status === 422) {
          router.replace('/account');
        }
      },
      onSuccess: null,
    });
  };

  return (
    <main className="relative flex flex-col items-center justify-center h-screen space-y-10 bg-secondary-midnight">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      <div className="w-full py-5">
        <div className="relative flex flex-col mx-auto space-y-5">
          <div className="flex flex-col items-center justify-center mx-auto">
            <Card>
              <Card.Body title={workspace.name} subtitle="You are invited to join this workspace." />
              <Card.Footer>
                {data ? (
                  <Button className="" disabled={isSubmitting} onClick={join}>
                    Join Workspace
                  </Button>
                ) : (
                  <Link href="/auth/login">
                    <a className="flex items-center justify-center px-5 py-2 space-x-3 text-white bg-blue-600 rounded hover:bg-blue-500">
                      Create an account
                    </a>
                  </Link>
                )}
              </Card.Footer>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export const getServerSideProps = async (context) => {
  Initializer.init();
  const { code } = context.query;
  const workspace = await workspaceService.getInvitation(code);
  return { props: JSON.parse(JSON.stringify({ workspace })) };
};

export default Invite;
