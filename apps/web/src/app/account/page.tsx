'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

import Button from 'app/_components/Button';
import Card from 'app/_components/Card';
import Content from 'app/_components/Content';
import {_acceptInvitation, _declineInvitation, api, useInvitations, useWorkspaces} from 'lib/client';
import {Route} from 'next';

export default function Welcome() {
  const router = useRouter();
  const {data: invitationsData, isLoading: isFetchingInvitations} = useInvitations();
  const {data: workspacesData, isLoading: isFetchingWorkspaces} = useWorkspaces();
  const [isSubmitting, setSubmittingState] = useState(false);

  // mutatations
  const accept = (memberId) => {
    api({
      ..._acceptInvitation(memberId),
      setLoading: (state) => setSubmittingState(state as boolean),
    });
  };
  const decline = (memberId) => {
    api({
      ..._declineInvitation(memberId),
      setLoading: (state) => setSubmittingState(state as boolean),
    });
  };

  const navigate = (workspace) => {
    router.replace(`/account/${workspace.slug}` as Route);
  };

  return (
    <>
      <Content.Title title="Glyphx Dashboard" subtitle="Explore data anywhere" />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {isFetchingWorkspaces ? (
            <Card>
              <Card.Body />
              <Card.Footer />
            </Card>
          ) : workspacesData?.workspaces?.length > 0 ? (
            workspacesData.workspaces.map((workspace, index) => (
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
      <Content.Divider thick />
      <Content.Title
        title="Workspace Invitations"
        subtitle="Listed here are the invitations received by your account"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {isFetchingInvitations ? (
            <Card>
              <Card.Body />
              <Card.Footer />
            </Card>
          ) : invitationsData?.invitations?.length > 0 ? (
            invitationsData.invitations.map((invitation, index) => (
              <Card key={index}>
                <Card.Body
                  title={invitation.workspace.name}
                  subtitle={`You have been invited by ${invitation.invitedBy.name || invitation.invitedBy.email}`}
                />
                <Card.Footer>
                  <Button className="" disabled={isSubmitting} onClick={() => accept(invitation.id)}>
                    Accept
                  </Button>
                  <Button
                    className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
                    disabled={isSubmitting}
                    onClick={() => decline(invitation.id)}
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
    </>
  );
}
