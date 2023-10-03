'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';

import Card from 'app/_components/Card';
import Button from 'app/_components/Button';
import {_joinWorkspace, api, useWorkspace} from 'lib/client';
import {Route} from 'next';

export default function Invite() {
  const router = useRouter();
  const {data} = useSession();
  const [isSubmitting, setSubmittingState] = useState(false);
  const {data: workspace} = useWorkspace();

  const join = () => {
    api({
      ..._joinWorkspace(workspace.workspace.inviteCode),
      setLoading: (state) => setSubmittingState(state as boolean),
      onSuccess: (data) => {
        router.replace(`/${data.workspace.id}` as Route);
      },
      onError: (status) => {
        if (status === 422) {
          router.replace('/account' as Route);
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center mx-auto h-full w-full">
      <Card>
        <Card.Body title={workspace?.workspace.name} subtitle="You are invited to join this workspace." />
        <Card.Footer>
          {data ? (
            <Button className="" disabled={isSubmitting} onClick={join}>
              Join Workspace
            </Button>
          ) : (
            <Link
              href={'/auth/login' as Route}
              className="flex items-center justify-center px-5 py-2 space-x-3 text-black bg-yellow rounded hover:bg-blue-500"
            >
              Create an account
            </Link>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}
