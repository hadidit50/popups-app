import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: 'large' | 'medium';
  icon?: IconName;
  fullWidth?: boolean;
}

function classes({ variant = 'primary', size = 'large', fullWidth }: CommonProps) {
  return [styles.button, styles[variant], size === 'medium' && styles.medium, fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');
}

interface ButtonProps extends CommonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

/** A real <button>. Large (56px) by default; never smaller than 48px. */
export function Button(props: ButtonProps) {
  const { children, icon, onClick, loading, disabled, type = 'button' } = props;
  return (
    <button
      type={type}
      className={classes(props)}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={props['aria-label']}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon ? <Icon name={icon} size={22} /> : null}
      <span>{children}</span>
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  href: string;
  external?: boolean;
}

/** Looks like a button, behaves like a link (navigation). */
export function ButtonLink(props: ButtonLinkProps) {
  const { children, icon, href, external } = props;
  const content = (
    <>
      {icon ? <Icon name={icon} size={22} /> : null}
      <span>{children}</span>
    </>
  );
  return external ? (
    <a className={classes(props)} href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link className={classes(props)} href={href}>
      {content}
    </Link>
  );
}
