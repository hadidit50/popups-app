import type { ReactNode } from 'react';
import styles from './Page.module.css';

/** Page container: centered, comfortable gutters, and room for the bottom tab bar on phones. */
export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
