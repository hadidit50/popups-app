'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { t } from '@/lib/i18n';
import { Icon } from './Icon';
import styles from './Form.module.css';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
}

function FieldShell({ label, hint, error, optional, id, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optional ? <span className={styles.optional}>{t('form.optional')}</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <Icon name="alert-circle-outline" size={18} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string | null) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

/** Labeled text input with hint and error, wired for screen readers. */
export function TextField({ label, hint, error, optional, ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={id}
        className={[styles.input, error && styles.invalid].filter(Boolean).join(' ')}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={!optional}
        {...input}
      />
    </FieldShell>
  );
}

export function TextArea({ label, hint, error, optional, ...input }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        className={[styles.textarea, error && styles.invalid].filter(Boolean).join(' ')}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, optional, children, ...input }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={id}
        className={[styles.select, error && styles.invalid].filter(Boolean).join(' ')}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** A single choice among a few options, as big pill buttons (radio group semantics). */
export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.segmented} role="radiogroup" aria-label={legend}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={styles.segment} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Alert({ tone, children }: { tone: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const cls = tone === 'error' ? styles.alertError : tone === 'ok' ? styles.alertOk : styles.alertInfo;
  return (
    <p className={`${styles.alert} ${cls}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function FormCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      {title ? <h2 className="t-title">{title}</h2> : null}
      {children}
    </section>
  );
}

export { styles as formStyles };
