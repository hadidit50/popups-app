import {
  mdiAccountCircle,
  mdiAccountCircleOutline,
  mdiAccountCogOutline,
  mdiAlertCircle,
  mdiAlertCircleOutline,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClockOutline,
  mdiCompass,
  mdiCompassOutline,
  mdiDotsHorizontalCircleOutline,
  mdiFood,
  mdiHanger,
  mdiHeart,
  mdiHeartOutline,
  mdiMap,
  mdiMapMarkerOutline,
  mdiMapOutline,
  mdiMapSearchOutline,
  mdiNavigationVariant,
  mdiPaletteOutline,
  mdiPaletteSwatchOutline,
  mdiPartyPopper,
  mdiProgressClock,
  mdiShareVariant,
  mdiStarFourPointsOutline,
  mdiStorefrontOutline,
  mdiTeddyBear,
  mdiTicketOutline,
  mdiTimerSand,
  mdiViewGridOutline,
  mdiWifiOff,
} from '@mdi/js';

// Material Design Icons — the same set the shared category metadata names (e.g. "storefront-outline").
const ICONS = {
  'account-circle': mdiAccountCircle,
  'account-circle-outline': mdiAccountCircleOutline,
  'account-cog-outline': mdiAccountCogOutline,
  'alert-circle': mdiAlertCircle,
  'alert-circle-outline': mdiAlertCircleOutline,
  check: mdiCheck,
  'check-circle': mdiCheckCircle,
  'chevron-left': mdiChevronLeft,
  'chevron-right': mdiChevronRight,
  'clock-outline': mdiClockOutline,
  compass: mdiCompass,
  'compass-outline': mdiCompassOutline,
  'dots-horizontal-circle-outline': mdiDotsHorizontalCircleOutline,
  food: mdiFood,
  hanger: mdiHanger,
  heart: mdiHeart,
  'heart-outline': mdiHeartOutline,
  map: mdiMap,
  'map-marker-outline': mdiMapMarkerOutline,
  'map-outline': mdiMapOutline,
  'map-search-outline': mdiMapSearchOutline,
  'navigation-variant': mdiNavigationVariant,
  'palette-outline': mdiPaletteOutline,
  'palette-swatch-outline': mdiPaletteSwatchOutline,
  'party-popper': mdiPartyPopper,
  'progress-clock': mdiProgressClock,
  'share-variant': mdiShareVariant,
  'star-four-points-outline': mdiStarFourPointsOutline,
  'storefront-outline': mdiStorefrontOutline,
  'teddy-bear': mdiTeddyBear,
  'ticket-outline': mdiTicketOutline,
  'timer-sand': mdiTimerSand,
  'view-grid-outline': mdiViewGridOutline,
  'wifi-off': mdiWifiOff,
} as const;

export type IconName = keyof typeof ICONS;

export function isIconName(name: string): name is IconName {
  return name in ICONS;
}

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

/** "Forward" in a right-to-left page points left. */
export const FORWARD_CHEVRON: IconName = 'chevron-left';

/** Decorative by default: the surrounding control carries the accessible name. */
export function Icon({ name, size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={ICONS[name]} fill={color} />
    </svg>
  );
}
