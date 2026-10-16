'use client';

import { useState } from 'react';
import { LAUNCH_CITIES } from '@whats-poppin/shared';
import { useI18n } from '@/lib/i18n-client';
import { useLocation } from '@/lib/location';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import styles from './LocationControls.module.css';

/** City picker + "use my location", in a sheet. */
export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { state, requestGps, chooseCity, chooseEverywhere } = useLocation();
  const currentCity = state.kind === 'city' ? state.citySlug : null;
  return (
    <Sheet open={open} onClose={onClose} title={t('location.sheetTitle')} description={t('location.sheetBody')}>
      <Button
        icon="crosshairs-gps"
        fullWidth
        loading={state.kind === 'locating'}
        onClick={() => {
          requestGps();
          onClose();
        }}
      >
        {t('location.useMyLocation')}
      </Button>
      <ul className={styles.cities}>
        {LAUNCH_CITIES.map((c) => (
          <li key={c.slug}>
            <button
              type="button"
              className={styles.city}
              aria-pressed={currentCity === c.slug}
              onClick={() => {
                chooseCity(c.slug);
                onClose();
              }}
            >
              {t(`cities.${c.slug}`)}
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        fullWidth
        onClick={() => {
          chooseEverywhere();
          onClose();
        }}
      >
        {t('location.everywhere')}
      </Button>
    </Sheet>
  );
}

/** "📍 ליד: תל אביב-יפו · שינוי" — always visible, one tap to change. */
export function LocationPill() {
  const { t } = useI18n();
  const { label, state } = useLocation();
  const [open, setOpen] = useState(false);
  const text = state.kind === 'locating' ? t('location.locating') : label ? t('location.near', { place: label }) : t('location.unknown');
  return (
    <>
      <button type="button" className={styles.pill} onClick={() => setOpen(true)} aria-label={`${t('location.changeLabel')}: ${text}`}>
        <Icon name="map-marker-outline" size={20} />
        <span className={styles.pillLabel}>{text}</span>
        <span className={styles.change}>· {t('location.change')}</span>
      </button>
      <LocationSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Friendly explanation before asking the browser for location. Falls back to choosing a city. */
export function LocationPrompt() {
  const { t } = useI18n();
  const { state, requestGps } = useLocation();
  const [open, setOpen] = useState(false);
  const denied = state.kind === 'denied';
  return (
    <div className={styles.prompt} role="region" aria-live="polite">
      <h3 className="t-heading">{denied ? t('location.deniedTitle') : t('location.promptTitle')}</h3>
      <p className="t-body">{denied ? t('location.deniedBody') : t('location.promptBody')}</p>
      <div className={styles.promptActions}>
        {!denied ? (
          <Button icon="crosshairs-gps" onClick={requestGps} loading={state.kind === 'locating'}>
            {t('location.useMyLocation')}
          </Button>
        ) : null}
        <Button variant={denied ? 'primary' : 'secondary'} icon="city-variant-outline" onClick={() => setOpen(true)}>
          {t('location.chooseCity')}
        </Button>
      </div>
      <LocationSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
