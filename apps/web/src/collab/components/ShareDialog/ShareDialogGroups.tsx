'use client';
import clsx from 'clsx';
import {ComponentProps} from 'react';
import {Select} from '../../primitives/Select';
import {Document, DocumentAccess, DocumentGroup} from '../../types';
import styles from './ShareDialogRows.module.css';
import {ClientDocumentManager} from 'collab/lib/client/ClientDocumentManager';

interface Props extends ComponentProps<'div'> {
  documentId: Document['id'];
  fullAccess: boolean;
  groups: DocumentGroup[];
  onSetGroups: () => void;
}

export function ShareDialogGroups({documentId, fullAccess, groups, onSetGroups, className, ...props}: Props) {
  const clientDoc = new ClientDocumentManager();
  // Remove a group from a room
  async function handleRemoveDocumentGroup(id: DocumentGroup['id']) {
    const {data, error} = await clientDoc.removeGroupAccess({
      projectId: id,
      documentId: documentId,
    });

    if (error || !data) {
      return;
    }

    onSetGroups();
  }

  // Update a collaborator in the room using email as user id
  async function handleUpdateDocumentGroup(id: DocumentGroup['id'], access: DocumentAccess) {
    const {data, error} = await clientDoc.updateGroupAccess({
      projectId: id,
      documentId: documentId,
      access: access,
    });

    if (error || !data) {
      return;
    }

    onSetGroups();
  }

  return (
    <div className={clsx(className, styles.rows)} {...props}>
      {groups
        ? groups.map(({name, id, access}) => (
            <div className={styles.row} key={id}>
              <div className={styles.rowInfo}>
                <span className={styles.rowName}>{name}</span>
                {fullAccess ? (
                  <button className={styles.rowRemoveButton} onClick={() => handleRemoveDocumentGroup(id)}>
                    Remove
                  </button>
                ) : null}
              </div>
              <div className={styles.rowAccessSelect}>
                <Select
                  aboveOverlay
                  disabled={!fullAccess}
                  initialValue={access}
                  items={[
                    {
                      title: 'Can edit',
                      value: DocumentAccess.EDIT,
                      description: 'Group can read, edit, and share the document',
                    },
                    {
                      title: 'Can read',
                      value: DocumentAccess.READONLY,
                      description: 'Group can only read the document',
                    },
                  ]}
                  onChange={(value) => {
                    handleUpdateDocumentGroup(id, value as DocumentAccess);
                  }}
                  value={access}
                />
              </div>
            </div>
          ))
        : null}
    </div>
  );
}
