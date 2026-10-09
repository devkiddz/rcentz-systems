import styles from './DeliveryProgress.module.css';

export function DeliveryProgress({ value, label = 'Project progress' }: { value: number; label?: string }) {
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div className={styles.track} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <div className={styles.fill} style={{ width: `${progress}%` }} />
      <span aria-hidden="true" className={styles.marker} data-active={progress > 0 && progress < 100} style={{ left: `clamp(6px, ${progress}%, calc(100% - 6px))` }}>
        <span className={styles.pulse} />
      </span>
    </div>
  );
}
