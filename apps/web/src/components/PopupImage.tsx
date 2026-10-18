'use client';

import { useState } from 'react';
import { CATEGORIES, type CategorySlug } from '@whats-poppin/shared';
import { Icon, isIconName } from './Icon';

interface PopupImageProps {
  src: string | null | undefined;
  category: CategorySlug;
  aspectRatio: string;
}

/**
 * Pop-up photo with a graceful fallback: no image or a broken one shows the category color
 * with its icon, never an empty box. Decorative (alt="") because the card text describes it.
 */
export function PopupImage({ src, category, aspectRatio }: PopupImageProps) {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORIES[category] ?? CATEGORIES.more;
  const showFallback = !src || failed;
  return (
    <div
      style={{
        aspectRatio,
        // A soft tint of the category color: recognisable, but calm next to real photos.
        background: `color-mix(in srgb, ${meta.color} 13%, white)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showFallback ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: meta.color }}>
          {isIconName(meta.icon) ? <Icon name={meta.icon} size={48} /> : null}
        </div>
      ) : (
        // Plain <img> on purpose: images come from many hosts (organizers, Storage, CDNs).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
