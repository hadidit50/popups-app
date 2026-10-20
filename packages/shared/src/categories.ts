// Category metadata shared by the app and admin panel.
// Names are NOT here: they live in the i18n files under "categories.<slug>".
// Icons are MaterialCommunityIcons names (bundled with @expo/vector-icons), so a
// category is always recognisable by shape, not only by color.

export const CATEGORY_SLUGS = ['food', 'fashion', 'markets', 'art', 'kids', 'brands', 'more'] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryMeta {
  slug: CategorySlug;
  /** Marker / chip accent color */
  color: string;
  icon: string;
  emoji: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryMeta> = {
  food: { slug: 'food', color: '#B8460B', icon: 'food', emoji: '🍔' },
  fashion: { slug: 'fashion', color: '#C2255C', icon: 'hanger', emoji: '👗' },
  markets: { slug: 'markets', color: '#237032', icon: 'storefront-outline', emoji: '🛍️' },
  art: { slug: 'art', color: '#946800', icon: 'palette-outline', emoji: '🎨' },
  kids: { slug: 'kids', color: '#1971C2', icon: 'teddy-bear', emoji: '🧸' },
  brands: { slug: 'brands', color: '#0B7285', icon: 'star-four-points-outline', emoji: '✨' },
  more: { slug: 'more', color: '#495057', icon: 'dots-horizontal-circle-outline', emoji: '➕' },
};

export const CATEGORY_LIST: CategoryMeta[] = CATEGORY_SLUGS.map((s) => CATEGORIES[s]);
