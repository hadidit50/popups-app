'use client';

import type { PopupEventType } from '@whats-poppin/shared';
import { getSessionId } from './session';
import { getSupabaseBrowserClient } from './supabase/client';

/**
 * Records a view / save / navigate / share / impression / click. Fire-and-forget: tracking must
 * never slow down or break the page. No-op in demo mode.
 */
export function track(popupId: string, type: PopupEventType, surface?: string, promotionId?: string | null) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || popupId.startsWith('demo-')) return;
  void supabase
    .rpc('track_popup_event', {
      p_popup_id: popupId,
      p_event_type: type,
      p_session_id: getSessionId(),
      p_surface: surface ?? null,
      p_promotion_id: promotionId && !promotionId.startsWith('demo-') ? promotionId : null,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}
