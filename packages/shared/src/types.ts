// Row shapes returned by the Supabase API. Kept by hand in sync with supabase/migrations.
// (Later: replace with `supabase gen types typescript`.)

import type { CategorySlug } from './categories.ts';
import type { OpeningHoursRow } from './status.ts';

export type PopupStatusDb = 'pending' | 'approved' | 'rejected';
export type PopupSource = 'manual' | 'organizer';
export type PriceRange = 'free' | 'low' | 'medium' | 'high';
export type PromotionPlacement = 'hot_now' | 'nearby_top' | 'map_highlight';
export type PopupEventType = 'view' | 'save' | 'unsave' | 'navigate' | 'share' | 'impression' | 'click';
export type UserRole = 'user' | 'organizer' | 'admin';

/** A pop-up as shown in lists, cards and on the map. */
export interface PopupSummary {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  category: CategorySlug;
  country_code: string;
  city_slug: string;
  city_name: string;
  address: string;
  lat: number;
  lng: number;
  timezone: string;
  starts_at: string;
  ends_at: string;
  price_range: PriceRange;
  cover_image_url: string | null;
  hours: OpeningHoursRow[];
  /** Present when the query knows the user's position. */
  distance_km?: number | null;
  /** Present when the item is placed by a promotion. Always render the "Sponsored" tag. */
  is_sponsored?: boolean;
  promotion_id?: string | null;
}

export interface PopupDetails extends PopupSummary {
  description: string | null;
  images: { url: string; alt: string | null }[];
  website_url: string | null;
  instagram_url: string | null;
  wheelchair_accessible: boolean | null;
  parking_available: boolean | null;
  kid_friendly: boolean | null;
  accessibility_notes: string | null;
  organizer_name: string | null;
}

export interface NearbyFilters {
  category?: CategorySlug | null;
  open_now?: boolean;
  today?: boolean;
  this_weekend?: boolean;
  free_only?: boolean;
}
