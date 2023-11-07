'use client';
import clsx from 'clsx';
import {useSession} from 'next-auth/react';
import {ComponentProps, FormEvent, useState} from 'react';
import {PlusIcon} from '../../icons';
import {Button} from '../../primitives/Button';
import {Select} from '../../primitives/Select';
import {Spinner} from '../../primitives/Spinner';
import {Document, DocumentAccess, DocumentGroup, Group} from 'types';
import {capitalize} from '../../utils';
import styles from './ShareDialogInvite.module.css';
import {ClientDocumentManager} from 'collab/lib/client/ClientDocumentManager';

interface Props extends ComponentProps<'div'> {
  documentId: Document['id'];
  fullAccess: boolean;
  currentGroups: Group[];
  onSetGroups: () => void;
}

export function ShareDialogInviteGroup({
  documentId,
  fullAccess,
  onSetGroups,
  className,
  currentGroups,
  ...props
}: Props) {
  const {data: session} = useSession();
  const clientDoc = new ClientDocumentManager();
  const [isInviteLoading, setInviteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  // Add a group to the room
  async function handleAddDocumentGroup(id: DocumentGroup['id']) {
    setErrorMessage(undefined);
    setInviteLoading(true);

    const {error} = await clientDoc.updateGroupAccess({
      projectId: id,
      documentId: documentId,
      access: DocumentAccess.READONLY,
    });

    setInviteLoading(false);

    if (error) {
      setErrorMessage(error?.suggestion);
      return;
    }

    onSetGroups();
  }

  const invitableGroupIds = (session?.user?.projectIds ?? []).filter((projectId) =>
    currentGroups.every((group) => group.id !== projectId)
  );

  return (
    <div className={clsx(className, styles.section)} {...props}>
      {fullAccess ? (
        <>
          {!session || invitableGroupIds.length ? (
            <form
              className={styles.inviteForm}
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const id = new FormData(e.currentTarget).get('projectId') as string;
                handleAddDocumentGroup(id);
              }}
            >
              <Select
                key={currentGroups[0]?.id || undefined}
                aboveOverlay
                name="projectId"
                className={styles.inviteSelect}
                items={invitableGroupIds.map((projectId) => ({
                  value: projectId,
                  title: capitalize(projectId),
                }))}
                placeholder="Choose a group…"
                required
                disabled={isInviteLoading}
              />
              <Button
                className={styles.inviteButton}
                icon={isInviteLoading ? <Spinner /> : <PlusIcon />}
                disabled={isInviteLoading}
              >
                Invite
              </Button>
            </form>
          ) : (
            <div className={clsx(styles.error, styles.inviteFormMessage)}>
              All of your groups have already been added.
            </div>
          )}
          {errorMessage && <div className={clsx(styles.error, styles.inviteFormMessage)}>{errorMessage}</div>}
        </>
      ) : (
        <div className={styles.error}>You need full access to invite groups.</div>
      )}
    </div>
  );
}
