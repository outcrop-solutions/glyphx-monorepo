import styles from './loading-dots.module.css';

export const LoadingDots = ({className}: {className?: string}) => {
  return (
    <div className={className ? className : 'w-full h-full'}>
      <span className={styles.loading}>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
};
