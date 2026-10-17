-- WHATS POPPIN — remove the 26 sample pop-ups (run once, when you start adding real ones).
-- Paste into Supabase → SQL Editor → Run. Deletes only the sample pop-ups by name;
-- their hours, photos, saves, statistics and promotions go with them. Cities and categories stay.
delete from public.popups
where slug in (
    'bat-galim-coffee-launch',
    'beer-sheva-flea-market',
    'beer-sheva-makers-fair',
    'eilat-beach-cinema',
    'eilat-swimwear-popup',
    'emek-refaim-patisserie',
    'first-station-fashion',
    'florentin-food-market',
    'german-colony-farmers-market',
    'hadar-design-fair',
    'jaffa-street-walls',
    'levinsky-plant-popup',
    'liberty-bell-kids-games',
    'mahane-yehuda-night-market',
    'nachlaot-temp-gallery',
    'negev-morning-bakery',
    'pending-candle-workshop',
    'port-designers-fair',
    'rishon-beach-food',
    'rothschild-taco-truck',
    'sarona-vintage-market',
    'sneaker-drop-dizengoff',
    'sport-collection-launch',
    'wadi-nisnas-hummus',
    'wooden-toys-popup',
    'yarkon-kids-ceramics'
);

-- Should show 0 sample pop-ups left:
select count(*) as sample_popups_left from public.popups where slug in ('florentin-food-market', 'sarona-vintage-market');
