'use client';
import {startTransition, useState} from 'react';
import {useRouter} from 'next/navigation';
import Button from 'app/_components/Button';
import Card from 'app/_components/Card';
import Content from 'app/_components/Content';
import {useInvitations, useWorkspaces} from 'lib/client';
import {Route} from 'next';
import {acceptInvitation, declineInvitation} from 'actions';

export default function Welcome() {
  const router = useRouter();
  const {data: invitations, isLoading: isFetchingInvitations} = useInvitations();
  const {data: workspaces, isLoading: isFetchingWorkspaces} = useWorkspaces();
  const [isSubmitting, setSubmittingState] = useState(false);
  const navigate = (workspace) => {
    router.replace(`/${workspace.id}` as Route);
  };

  return (
    <div className="h-full">
      <Content.Title title="Glyphx Dashboard" subtitle="Explore data anywhere" />
      <Content.Divider />
      <div className="overflow-y-auto h-2/3 py-2 my-4">
        <Content.Container>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {isFetchingWorkspaces ? (
              <Card>
                <Card.Body />
                <Card.Footer />
              </Card>
            ) : workspaces && workspaces?.length > 0 ? (
              workspaces.map((workspace, index) => (
                <Card key={index}>
                  <Card.Body title={workspace.name} />
                  <Card.Footer>
                    <button className="text-blue-600" onClick={() => navigate(workspace)}>
                      Select workspace &rarr;
                    </button>
                  </Card.Footer>
                </Card>
              ))
            ) : (
              <Card.Empty>Start creating a workspace now</Card.Empty>
            )}
          </div>
        </Content.Container>
      </div>
      <Content.Title
        title="Workspace Invitations"
        subtitle="Listed here are the invitations received by your account"
      />
      <Content.Divider />
      <div className="overflow-y-auto h-1/3 py-2 my-4">
        <Content.Container>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {isFetchingInvitations ? (
              <Card>
                <Card.Body />
                <Card.Footer />
              </Card>
            ) : invitations && invitations.length > 0 ? (
              invitations.map((invitation, index) => (
                <Card key={index}>
                  <Card.Body
                    title={invitation.workspace.name}
                    subtitle={`You have been invited by ${invitation.invitedBy.name || invitation.invitedBy.email}`}
                  />
                  <Card.Footer>
                    <Button
                      className=""
                      disabled={isSubmitting}
                      onClick={() =>
                        startTransition(() => {
                          acceptInvitation(invitation.id as string);
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
                      disabled={isSubmitting}
                      onClick={() =>
                        startTransition(() => {
                          declineInvitation(invitation.id as string);
                        })
                      }
                    >
                      Decline
                    </Button>
                  </Card.Footer>
                </Card>
              ))
            ) : (
              <Card.Empty>You haven&apos;t received any invitations to a workspace yet.</Card.Empty>
            )}
          </div>
        </Content.Container>
      </div>
    </div>
  );
}
