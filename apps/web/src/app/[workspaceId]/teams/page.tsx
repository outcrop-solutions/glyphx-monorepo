'use client';
import React, {startTransition, useState} from 'react';
import Link from 'next/link';
import {useSession} from 'next-auth/react';
import Card from 'app/_components/Card';
import Button from 'app/_components/Button';
import {Route} from 'next';
import {joinWorkspace} from 'actions';
import {useRecoilValue} from 'recoil';
import {workspaceAtom} from 'state';

export default function Invite() {
  const {data} = useSession();
  const [isSubmitting, setSubmittingState] = useState(false);
  const workspace = useRecoilValue(workspaceAtom);

  return (
    <div className="flex flex-col items-center justify-center mx-auto h-full w-full">
      <Card>
        <Card.Body title={workspace?.name} subtitle="You are invited to join this workspace." />
        <Card.Footer>
          {data ? (
            <Button
              className=""
              disabled={isSubmitting}
              onClick={() =>
                startTransition(() => {
                  joinWorkspace(workspace?.inviteCode);
                })
              }
            >
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
