import {useRouter} from 'next/navigation';
import {ComponentProps} from 'react';
import {DOCUMENT_URL} from '../../constants';
import {PlusIcon} from '../../icons';
import {Button} from '../../primitives/Button';
import {Popover} from '../../primitives/Popover';
import {Document, DocumentGroup, DocumentType, DocumentUser} from '../../types';
import styles from './DocumentCreatePopover.module.css';
import {ClientDocumentManager} from 'collab/lib/client/ClientDocumentManager';

interface Props extends Omit<ComponentProps<typeof Popover>, 'content'> {
  documentName?: Document['name'];
  draft: Document['draft'];
  projectIds?: DocumentGroup['id'][];
  userId: DocumentUser['id'];
}

export function DocumentCreatePopover({
  documentName = 'Untitled',
  projectIds,
  userId,
  draft,
  children,
  ...props
}: Props) {
  const router = useRouter();

  // Create a new document, then navigate to the document's URL location
  async function createNewDocument(name: string, type: DocumentType) {
    const clientDoc = new ClientDocumentManager();
    const {data, error} = await clientDoc.createDocument({
      name: documentName,
      type: type,
      userId: userId,
      draft: draft,
      projectIds: draft ? undefined : projectIds,
    });

    if (error || !data) {
      return;
    }

    const newDocument: Document = data;
    // redirect to new document
    router.push(DOCUMENT_URL(newDocument.type, newDocument.id));
  }

  return (
    <Popover
      content={
        <div className={styles.popover}>
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument(documentName, 'text');
            }}
            variant='subtle'
          >
            Text
          </Button>
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument(documentName, 'whiteboard');
            }}
            variant='subtle'
          >
            Whiteboard
          </Button>
          <Button
            disabled
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument(documentName, 'spreadsheet');
            }}
            variant='subtle'
          >
            Spreadsheet
          </Button>
        </div>
      }
      modal
      side='bottom'
      {...props}
    >
      {children}
    </Popover>
  );
}
