import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { splitDistance } from '@whats-poppin/shared';

export function useFormatters() {
  const { t } = useTranslation();
  const distance = useCallback(
    (km: number | null | undefined) => {
      if (km === null || km === undefined) return null;
      const { unit, value } = splitDistance(km);
      return t(`distance.${unit}`, { value });
    },
    [t],
  );
  return { distance };
}
