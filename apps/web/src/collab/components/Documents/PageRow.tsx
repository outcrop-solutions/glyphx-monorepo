import clsx from 'clsx';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
import {useSession} from 'next-auth/react';
import {ComponentProps, useCallback, useEffect, useState} from 'react';
import {DOCUMENT_URL} from '../../constants';
import {DeleteIcon, MoreIcon} from '../../icons';
import {getDocumentAccess} from '../../lib/client';
import {AvatarStack} from '../../primitives/AvatarStack';
import {Button} from '../../primitives/Button';
import {Popover} from '../../primitives/Popover';
import {Skeleton} from '../../primitives/Skeleton';
import {DocumentAccess, Group} from '../../types';
import {DocumentDeleteDialog} from './DocumentDeleteDialog';
import {DocumentIcon} from './DocumentIcon';
import styles from './DocumentRow.module.css';
import {ClientDocumentManager} from 'collab/lib/client/ClientDocumentManager';

// TODO: reconcile this with Page component in workspace sidebar to cshow presence across the various websites

export async function PageRow({page, className}) {
  const clientDoc = new ClientDocumentManager();
  const {data: liveUsers} = await clientDoc.getLiveUsers({documentIds: []});
  // find others by filtering out current user
  const others = liveUsers?.find((user) => user.documentId === page.id)?.users;

  const {id, name, type, lastConnection, accesses} = page;
  const [groups, setGroups] = useState<Group[]>([]);

  const {data: session} = useSession();
  const [currentUserAccess, setCurrentUserAccess] = useState(DocumentAccess.NONE);

  // Check if current user has access to edit the room
  useEffect(() => {
    if (!session) {
      return;
    }
    const access = getDocumentAccess({
      documentAccesses: accesses,
      userId: session.user?.id,
      projectIds: session.user?.projectIds!,
    });
    setCurrentUserAccess(access);
  }, [session, accesses]);

  // TODO swap to useSWR if enough time
  useEffect(() => {
    getGroupInfo();

    async function getGroupInfo() {
      const projectIds = Object.keys(accesses.groups);
      if (projectIds.length) {
        // const groups = await clientDoc.getGroups(projectIds);
        // setGroups(groups);
      }
    }
  }, [document]);

  const [isMoreOpen, setMoreOpen] = useState(false);

  const date = new Date(lastConnection);
  const docUrl = DOCUMENT_URL(type, id);

  const handleDeleteDialogOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setMoreOpen(false);
    }
  }, []);

  return (
    <div className={clsx(className, styles.row)}>
      <Link className={clsx(styles.container, styles.link)} href={docUrl}>
        <div className={styles.icon}>
          <DocumentIcon type={type} />
        </div>
        <div className={styles.info}>
          <span className={styles.documentName}>
            <span>{name}</span>
            {groups.length > 0 ? (
              <span className={styles.groups}>
                {groups.map((group) => (
                  <span key={group.id} className={styles.group}>
                    {group.name}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
          <span className={styles.documentDate}>Edited {formatDistanceToNow(date)} ago</span>
        </div>
        {others && (
          <div className={styles.presence}>
            <AvatarStack
              avatars={others.map((other) => ({
                name: other.info.name,
                src: other.info.image,
                color: other.info.color,
              }))}
              size={20}
              tooltip
            />
          </div>
        )}
      </Link>
      {currentUserAccess === DocumentAccess.FULL ? (
        <div className={styles.more}>
          <Popover
            align='end'
            content={
              <div className={styles.morePopover}>
                <DocumentDeleteDialog
                  documentId={page.id}
                  onDeleteDocument={() => {}}
                  onOpenChange={handleDeleteDialogOpenChange}
                >
                  <Button icon={<DeleteIcon />} variant='subtle'>
                    Delete
                  </Button>
                </DocumentDeleteDialog>
              </div>
            }
            modal
            onOpenChange={setMoreOpen}
            open={isMoreOpen}
            side='bottom'
            sideOffset={10}
          >
            <Button className={styles.moreButton} icon={<MoreIcon />} variant='secondary' />
          </Popover>
        </div>
      ) : null}
    </div>
  );
}

export function DocumentRowSkeleton({className, ...props}: ComponentProps<'div'>) {
  return (
    <div className={clsx(className, styles.row)} {...props}>
      <div className={styles.container}>
        <div className={styles.icon}>
          <Skeleton style={{width: 20, height: 20}} />
        </div>
        <div className={clsx(styles.info, styles.infoSkeleton)}>
          <span className={styles.documentName}>
            <Skeleton style={{width: 100}} />
          </span>
          <span className={styles.documentDate}>
            <Skeleton style={{width: 160}} />
          </span>
        </div>
      </div>
    </div>
  );
}
