import styles from './loading-dots.module.css';

export const LoadingDots = () => {
  return (
    <div className="w-full h-full">
      <span className={styles.loading}>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
};
