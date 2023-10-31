import {PageRow} from './PageRow';
import styles from '../../layouts/Documents/Documents.module.css';

export const DocumentRowGroup = async ({pages}) => {
  return (
    <>
      {pages.map((page) => {
        return <PageRow key={page.id} page={page} className={styles.row} />;
      })}
    </>
  );
};
