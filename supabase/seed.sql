-- WHATS POPPIN — seed data
-- All dates are relative to the day you run the seed, so "open now", "ending soon" and
-- "this weekend" always have content. Re-run `supabase db reset` to refresh them.
-- Images are Unsplash placeholders; the app shows a category-colored fallback if one fails.

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
insert into public.countries (code, name_he, name_en, timezone, currency, default_locale) values
  ('IL', 'ישראל', 'Israel', 'Asia/Jerusalem', 'ILS', 'he');

insert into public.cities (slug, country_code, name_he, name_en, center, is_launch_city, sort_order) values
  ('tel-aviv',      'IL', 'תל אביב-יפו', 'Tel Aviv-Yafo', 'SRID=4326;POINT(34.7818 32.0853)', true, 1),
  ('jerusalem',     'IL', 'ירושלים',     'Jerusalem',     'SRID=4326;POINT(35.2137 31.7683)', true, 2),
  ('haifa',         'IL', 'חיפה',        'Haifa',         'SRID=4326;POINT(34.9896 32.7940)', true, 3),
  ('rishon-lezion', 'IL', 'ראשון לציון', 'Rishon LeZion', 'SRID=4326;POINT(34.7925 31.9730)', true, 4),
  ('beer-sheva',    'IL', 'באר שבע',     'Be''er Sheva',  'SRID=4326;POINT(34.7913 31.2518)', true, 5),
  ('eilat',         'IL', 'אילת',        'Eilat',         'SRID=4326;POINT(34.9519 29.5577)', true, 6);

insert into public.categories (slug, color, icon, sort_order) values
  ('food',    '#B8460B', 'food', 1),
  ('fashion', '#C2255C', 'hanger', 2),
  ('markets', '#237032', 'storefront-outline', 3),
  ('art',     '#946800', 'palette-outline', 4),
  ('kids',    '#1971C2', 'teddy-bear', 5),
  ('brands',  '#0B7285', 'star-four-points-outline', 6),
  ('more',    '#495057', 'dots-horizontal-circle-outline', 7);

-- ---------------------------------------------------------------------------
-- Helpers (temporary, only for this seed)
-- ---------------------------------------------------------------------------
-- Local Israel time, N days from today: pg_temp.d(2, '18:00')
create function pg_temp.d(p_days int, p_time text)
returns timestamptz language sql as $$
  select (((now() at time zone 'Asia/Jerusalem')::date + p_days) + p_time::time) at time zone 'Asia/Jerusalem';
$$;

create function pg_temp.add_popup(
  p_slug text, p_title text, p_short text, p_description text, p_category text,
  p_city text, p_address text, p_lng double precision, p_lat double precision,
  p_starts timestamptz, p_ends timestamptz, p_price public.price_range,
  p_wheelchair boolean, p_parking boolean, p_kids boolean,
  p_instagram text, p_image text, p_image2 text default null, p_created_days_ago int default 7
) returns void language plpgsql as $$
declare
  v_id uuid;
begin
  insert into public.popups (
    slug, title, short_description, description, category, country_code, city_id, address, location,
    starts_at, ends_at, price_range, wheelchair_accessible, parking_available, kid_friendly,
    instagram_url, status, source, created_at
  ) values (
    p_slug, p_title, p_short, p_description, p_category, 'IL',
    (select id from public.cities where slug = p_city), p_address,
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
    p_starts, p_ends, p_price, p_wheelchair, p_parking, p_kids,
    p_instagram, 'approved', 'manual', now() - make_interval(days => p_created_days_ago)
  ) returning id into v_id;

  insert into public.popup_images (popup_id, url, alt, sort_order)
  values (v_id, 'https://images.unsplash.com/' || p_image || '?w=1200&q=75&auto=format&fit=crop', p_title, 0);
  if p_image2 is not null then
    insert into public.popup_images (popup_id, url, alt, sort_order)
    values (v_id, 'https://images.unsplash.com/' || p_image2 || '?w=1200&q=75&auto=format&fit=crop', p_title, 1);
  end if;
end;
$$;

-- Same hours on several weekdays (0 = Sunday ... 6 = Saturday).
create function pg_temp.hours(p_slug text, p_weekdays int[], p_opens text, p_closes text)
returns void language sql as $$
  insert into public.popup_hours (popup_id, weekday, opens, closes)
  select p.id, w, p_opens::time, p_closes::time
  from public.popups p, unnest(p_weekdays) as w
  where p.slug = p_slug;
$$;

-- ---------------------------------------------------------------------------
-- Pop-ups
-- ---------------------------------------------------------------------------

-- Tel Aviv-Yafo ------------------------------------------------------------
select pg_temp.add_popup('florentin-food-market', 'שוק האוכל של פלורנטין',
  '15 דוכנים של שפים צעירים, מוזיקה ובירה מקומית',
  'כל ערב בשבועות הקרובים: דוכני אוכל רחוב של שפים צעירים מהשכונה, די-ג''יי מקומי ובירה מבשלות קטנות. בואו רעבים.',
  'food', 'tel-aviv', 'רחוב ויטל 2, תל אביב-יפו', 34.7700, 32.0566,
  pg_temp.d(-10, '00:00'), pg_temp.d(20, '23:59'), 'medium', true, false, true,
  'https://instagram.com/florentin.foodmarket', 'photo-1555396273-367ea4eb4db5', 'photo-1504674900247-0877df9cc836', 3);
select pg_temp.hours('florentin-food-market', array[0,1,2,3,4,5,6], '12:00', '23:00');

select pg_temp.add_popup('sneaker-drop-dizengoff', 'Sneaker Drop – פופ-אפ סניקרס',
  'דרופ מוגבל של סניקרס במהדורה מיוחדת',
  'חנות זמנית לשלושה שבועות בלבד עם מהדורות מוגבלות, אזור התאמה אישית ומבצעי השקה. כל יום מגיעה סחורה חדשה.',
  'brands', 'tel-aviv', 'דיזנגוף 50, תל אביב-יפו', 34.7752, 32.0754,
  pg_temp.d(-4, '00:00'), pg_temp.d(12, '22:00'), 'high', true, true, false,
  'https://instagram.com/sneakerdrop.tlv', 'photo-1542291026-7eec264c27ff', 'photo-1556906781-9a412961c28c', 4);
select pg_temp.hours('sneaker-drop-dizengoff', array[0,1,2,3,4], '10:00', '22:00');
select pg_temp.hours('sneaker-drop-dizengoff', array[5], '09:00', '15:00');
select pg_temp.hours('sneaker-drop-dizengoff', array[6], '19:00', '23:00');

select pg_temp.add_popup('port-designers-fair', 'יריד המעצבים בנמל',
  'יותר מ-60 מעצבות ומעצבים ישראלים במקום אחד',
  'בגדים, תכשיטים, קרמיקה ועיצוב לבית ישירות מהיוצרים. מחירי יריד, אווירת ים, ואפשר לשלם באשראי בכל הדוכנים.',
  'fashion', 'tel-aviv', 'האנגר 11, נמל תל אביב', 34.7739, 32.0972,
  pg_temp.d(-1, '00:00'), pg_temp.d(1, '22:00'), 'medium', true, true, true,
  'https://instagram.com/port.designers', 'photo-1441986300917-64674bd600d8', 'photo-1490481651871-ab68de25d43d', 2);
select pg_temp.hours('port-designers-fair', array[0,1,2,3,4,5,6], '10:00', '22:00');

select pg_temp.add_popup('rothschild-taco-truck', 'טאקו מהמשאית – רוטשילד',
  'טאקו מקסיקני אמיתי ממשאית אוכל, רק לשבועיים',
  'משאית הטאקו המפורסמת חונה בשדרה. טורטיות טריות שנעשות במקום, אפשרויות טבעוניות ושתייה קרה.',
  'food', 'tel-aviv', 'שדרות רוטשילד 30, תל אביב-יפו', 34.7741, 32.0636,
  pg_temp.d(-12, '00:00'), pg_temp.d(0, '23:00'), 'low', true, false, true,
  'https://instagram.com/tacotruck.tlv', 'photo-1565299585323-38d6b0865b47', null, 12);
select pg_temp.hours('rothschild-taco-truck', array[0,1,2,3,4,5,6], '11:00', '23:00');

select pg_temp.add_popup('jaffa-street-walls', 'קירות מדברים – תערוכת רחוב ביפו',
  'תערוכת גרפיטי פתוחה 24/7 בסמטאות שוק הפשפשים',
  'עשרה אמנים צבעו קירות בסמטאות שוק הפשפשים. מסלול הליכה של כחצי שעה, מפה בכניסה ליד מגדל השעון.',
  'art', 'tel-aviv', 'שוק הפשפשים, יפו', 34.7568, 32.0535,
  pg_temp.d(-20, '00:00'), pg_temp.d(40, '23:59'), 'free', false, false, true,
  'https://instagram.com/talkingwalls.jaffa', 'photo-1460661419201-fd4cecdf8a8b', null, 20);

select pg_temp.add_popup('sarona-vintage-market', 'שוק הוינטג'' בשרונה',
  'בגדים, תקליטים ופריטי וינטג'' בסוף השבוע',
  'שוק וינטג'' של סוף שבוע עם עשרות דוכנים: בגדים יד שנייה, תקליטים, רהיטים קטנים ואוכל.',
  'markets', 'tel-aviv', 'מתחם שרונה, תל אביב-יפו', 34.7869, 32.0717,
  pg_temp.d(-30, '00:00'), pg_temp.d(30, '23:59'), 'free', true, true, true,
  'https://instagram.com/sarona.vintage', 'photo-1488459716781-31db52582fe9', null, 30);
select pg_temp.hours('sarona-vintage-market', array[4], '16:00', '22:00');
select pg_temp.hours('sarona-vintage-market', array[5], '09:00', '16:00');
select pg_temp.hours('sarona-vintage-market', array[6], '10:00', '19:00');

select pg_temp.add_popup('yarkon-kids-ceramics', 'סדנת קרמיקה לילדים בפארק',
  'סדנה פתוחה לגילאי 4–12, בלי הרשמה מראש',
  'אוהל סדנאות בפארק הירקון. כל ילד מכין כלי משלו ולוקח הביתה. כולל הצללה, ברזיות ושולחנות להורים.',
  'kids', 'tel-aviv', 'גני יהושע, פארק הירקון', 34.8094, 32.1006,
  pg_temp.d(-3, '00:00'), pg_temp.d(9, '18:00'), 'low', true, true, true,
  'https://instagram.com/yarkon.ceramics', 'photo-1503454537195-1dcabb73ffb9', null, 3);
select pg_temp.hours('yarkon-kids-ceramics', array[0,1,2,3,4], '15:00', '19:00');
select pg_temp.hours('yarkon-kids-ceramics', array[5,6], '09:00', '14:00');

select pg_temp.add_popup('levinsky-plant-popup', 'פופ-אפ צמחים ועציצים',
  'צמחי בית, עציצים מעוצבים וייעוץ חינם',
  'חנות צמחים זמנית בשוק לוינסקי. ייעוץ חינם איזה צמח מתאים לבית שלכם, כולל צמחים לדירות חשוכות.',
  'more', 'tel-aviv', 'לוינסקי 41, תל אביב-יפו', 34.7745, 32.0581,
  pg_temp.d(-6, '00:00'), pg_temp.d(2, '20:00'), 'low', false, false, true,
  'https://instagram.com/levinsky.plants', 'photo-1485955900006-10f4d324d411', null, 6);
select pg_temp.hours('levinsky-plant-popup', array[0,1,2,3,4,5,6], '09:00', '20:00');

-- Jerusalem ------------------------------------------------------------------
select pg_temp.add_popup('mahane-yehuda-night-market', 'שוק הלילה במחנה יהודה',
  'מוזיקה חיה, אוכל רחוב ובסטות פתוחות עד מאוחר',
  'בימי חמישי השוק נשאר פתוח בלילה: הופעות קטנות, דוכני אוכל מיוחדים ובסטות שמוכרות עד מאוחר.',
  'markets', 'jerusalem', 'שוק מחנה יהודה, ירושלים', 35.2123, 31.7849,
  pg_temp.d(-14, '00:00'), pg_temp.d(45, '23:59'), 'free', true, false, true,
  'https://instagram.com/machne.nights', 'photo-1533900298318-6b8da08a523e', null, 14);
select pg_temp.hours('mahane-yehuda-night-market', array[4], '20:00', '02:00');

select pg_temp.add_popup('first-station-fashion', 'אופנה ירושלמית בתחנה הראשונה',
  'מעצבות ירושלמיות, קולקציית סתיו ומחירי השקה',
  'שמונה מעצבות מירושלים מציגות את קולקציית הסתיו בחלל משותף. אפשר למדוד ולהזמין התאמות.',
  'fashion', 'jerusalem', 'התחנה הראשונה, דוד רמז 4, ירושלים', 35.2245, 31.7652,
  pg_temp.d(-2, '00:00'), pg_temp.d(6, '22:00'), 'medium', true, true, false,
  'https://instagram.com/jlm.fashion.popup', 'photo-1490481651871-ab68de25d43d', null, 2);
select pg_temp.hours('first-station-fashion', array[0,1,2,3,4], '11:00', '22:00');
select pg_temp.hours('first-station-fashion', array[5], '10:00', '14:00');
select pg_temp.hours('first-station-fashion', array[6], '19:00', '22:00');

select pg_temp.add_popup('nachlaot-temp-gallery', 'גלריה זמנית בנחלאות',
  'תערוכת צילום בבית אבן ישן, הכניסה חופשית',
  'תערוכת צילום של צלמים צעירים על החיים בשכונה. שיחת גלריה עם האמנים בכל יום שישי ב-11:00.',
  'art', 'jerusalem', 'רחוב התבור 12, נחלאות, ירושלים', 35.2101, 31.7826,
  pg_temp.d(-8, '00:00'), pg_temp.d(15, '21:00'), 'free', false, false, true,
  'https://instagram.com/nachlaot.gallery', 'photo-1513364776144-60967b0f800f', null, 8);
select pg_temp.hours('nachlaot-temp-gallery', array[0,1,2,3,4], '10:00', '21:00');
select pg_temp.hours('nachlaot-temp-gallery', array[5], '10:00', '14:00');

select pg_temp.add_popup('emek-refaim-patisserie', 'קונדיטוריה בפופ-אפ – עמק רפאים',
  'קינוחים צרפתיים של שף פטיסרי, רק החודש',
  'שף קונדיטור מפריז פותח קונדיטוריה זמנית: אקלרים, טארטים ומקרונים טריים כל בוקר. מומלץ להגיע מוקדם.',
  'food', 'jerusalem', 'עמק רפאים 22, ירושלים', 35.2195, 31.7608,
  pg_temp.d(-5, '00:00'), pg_temp.d(25, '20:00'), 'medium', true, false, true,
  'https://instagram.com/refaim.patisserie', 'photo-1551024601-bec78aea704b', null, 1);
select pg_temp.hours('emek-refaim-patisserie', array[0,1,2,3,4], '08:00', '20:00');
select pg_temp.hours('emek-refaim-patisserie', array[5], '07:30', '15:00');

select pg_temp.add_popup('liberty-bell-kids-games', 'פסטיבל משחקים בגן הפעמון',
  'משחקי חצר ענקיים, מתנפחים ופינת יצירה',
  'פסטיבל ילדים של סוף שבוע: שחמט ענק, מתנפחים, הפעלות ופינת יצירה. מתאים לגילאי 3–12.',
  'kids', 'jerusalem', 'גן הפעמון, ירושלים', 35.2245, 31.7681,
  pg_temp.d(-1, '00:00'), pg_temp.d(10, '19:00'), 'free', true, true, true,
  'https://instagram.com/jlm.kids.fest', 'photo-1566140967404-b8b3932483f5', null, 1);
select pg_temp.hours('liberty-bell-kids-games', array[4,5], '10:00', '17:00');
select pg_temp.hours('liberty-bell-kids-games', array[6], '10:00', '19:00');

-- Haifa ----------------------------------------------------------------------
select pg_temp.add_popup('german-colony-farmers-market', 'שוק האיכרים במושבה הגרמנית',
  'ירקות, גבינות ולחם ישירות מהחקלאים',
  'שוק איכרים שבועי עם חקלאים מהגליל והכרמל: ירקות עונתיים, גבינות בוטיק, לחם מחמצת ושמן זית.',
  'markets', 'haifa', 'שדרות בן גוריון, המושבה הגרמנית, חיפה', 34.9890, 32.8193,
  pg_temp.d(-21, '00:00'), pg_temp.d(60, '23:59'), 'free', true, true, true,
  'https://instagram.com/haifa.farmers', 'photo-1488459716781-31db52582fe9', null, 21);
select pg_temp.hours('german-colony-farmers-market', array[5], '08:00', '14:00');

select pg_temp.add_popup('wadi-nisnas-hummus', 'חומוס של סבתא – פופ-אפ בוואדי ניסנאס',
  'מתכון משפחתי של שלושה דורות, בצלחות חד-פעמיות מתכלות',
  'מסעדה זמנית בחצר אבן בוואדי ניסנאס. חומוס, פול ומסבחה טריים, ולימונדה ביתית.',
  'food', 'haifa', 'וואדי ניסנאס, חיפה', 34.9940, 32.8160,
  pg_temp.d(-9, '00:00'), pg_temp.d(5, '17:00'), 'low', false, false, true,
  'https://instagram.com/savta.hummus', 'photo-1540189549336-e6e99c3679fe', null, 9);
select pg_temp.hours('wadi-nisnas-hummus', array[0,1,2,3,4,5,6], '09:00', '17:00');

select pg_temp.add_popup('hadar-design-fair', 'יריד עיצוב בהדר',
  'מעצבים מקומיים, הדפסים, תכשיטים ועיצוב לבית',
  'יריד עיצוב בבניין באוהאוס משוחזר. מעצבים חיפאים מציגים ומוכרים ישירות, בלי פערי תיווך.',
  'fashion', 'haifa', 'רחוב הרצל 30, הדר, חיפה', 34.9997, 32.8092,
  pg_temp.d(2, '10:00'), pg_temp.d(4, '22:00'), 'medium', true, false, true,
  'https://instagram.com/hadar.design', 'photo-1441986300917-64674bd600d8', null, 1);
select pg_temp.hours('hadar-design-fair', array[0,1,2,3,4,5,6], '10:00', '22:00');

select pg_temp.add_popup('bat-galim-coffee-launch', 'השקת מותג קפה – בת גלים',
  'טעימות חינם של פולים חדשים מול הים',
  'מותג קפה ישראלי משיק תערובת חדשה: עמדת טעימות חינם, סדנאות קצרות להכנת קפה וחבילות השקה.',
  'brands', 'haifa', 'טיילת בת גלים, חיפה', 34.9800, 32.8326,
  pg_temp.d(-2, '00:00'), pg_temp.d(3, '21:00'), 'free', true, true, true,
  'https://instagram.com/coffee.launch', 'photo-1495474472287-4d71bcdd2085', null, 2);
select pg_temp.hours('bat-galim-coffee-launch', array[0,1,2,3,4,5,6], '07:00', '21:00');

-- Rishon LeZion --------------------------------------------------------------
select pg_temp.add_popup('rishon-beach-food', 'שוק אוכל בחוף ראשון',
  'אוכל רחוב, שקיעה ודי-ג''יי על החול',
  'מתחם אוכל זמני על החוף עם עשרה דוכנים, שולחנות על החול והופעות קטנות בשקיעה.',
  'food', 'rishon-lezion', 'חוף ראשון לציון', 34.7428, 31.9890,
  pg_temp.d(-7, '00:00'), pg_temp.d(14, '23:59'), 'medium', true, true, true,
  'https://instagram.com/rishon.beachfood', 'photo-1414235077428-338989a2e8c0', null, 7);
select pg_temp.hours('rishon-beach-food', array[0,1,2,3,4,5,6], '17:00', '00:00');

select pg_temp.add_popup('wooden-toys-popup', 'פופ-אפ צעצועי עץ',
  'צעצועים בעבודת יד ופינת משחק לפעוטות',
  'נגר מקומי מוכר צעצועי עץ בעבודת יד. יש פינת משחק לפעוטות ואפשר להזמין חריטת שם.',
  'kids', 'rishon-lezion', 'רוטשילד 50, ראשון לציון', 34.8040, 31.9640,
  pg_temp.d(-3, '00:00'), pg_temp.d(1, '19:00'), 'medium', true, false, true,
  'https://instagram.com/wooden.toys.il', 'photo-1596461404969-9ae70f2830c1', null, 3);
select pg_temp.hours('wooden-toys-popup', array[0,1,2,3,4,5,6], '10:00', '19:00');

select pg_temp.add_popup('sport-collection-launch', 'השקת קולקציה – מותג ספורט',
  'קולקציית ריצה חדשה, מדידות ומבצעי השקה',
  'מותג ספורט משיק קולקציית ריצה. ריצה קבוצתית קצרה בכל ערב ב-19:00 ומבצעים למשתתפים.',
  'brands', 'rishon-lezion', 'קניון הזהב, ראשון לציון', 34.7740, 31.9900,
  pg_temp.d(3, '10:00'), pg_temp.d(5, '22:00'), 'high', true, true, false,
  'https://instagram.com/sport.launch.il', 'photo-1556761175-5973dc0f32e7', null, 1);
select pg_temp.hours('sport-collection-launch', array[0,1,2,3,4,5,6], '10:00', '22:00');

-- Be'er Sheva ----------------------------------------------------------------
select pg_temp.add_popup('beer-sheva-makers-fair', 'יריד יוצרים בעיר העתיקה',
  'אמנים מהנגב, סדנאות קצרות ומוזיקה',
  'יריד יוצרים בעיר העתיקה של באר שבע: קדרות, אריגה, צילום ותכשיטים. סדנאות קצרות לכל המשפחה.',
  'art', 'beer-sheva', 'רחוב קק"ל, העיר העתיקה, באר שבע', 34.7880, 31.2400,
  pg_temp.d(-1, '00:00'), pg_temp.d(8, '22:00'), 'free', true, true, true,
  'https://instagram.com/negev.makers', 'photo-1513364776144-60967b0f800f', null, 1);
select pg_temp.hours('beer-sheva-makers-fair', array[0,1,2,3,4], '16:00', '22:00');
select pg_temp.hours('beer-sheva-makers-fair', array[5], '10:00', '15:00');

select pg_temp.add_popup('negev-morning-bakery', 'מאפיית בוקר בפופ-אפ',
  'קרואסונים, בורקס ולחמים טריים מהטאבון',
  'מאפייה זמנית בחצר בעיר העתיקה. אופים מול הקהל משש בבוקר, ומה שנגמר נגמר.',
  'food', 'beer-sheva', 'רחוב סמילנסקי 10, באר שבע', 34.7930, 31.2430,
  pg_temp.d(-4, '00:00'), pg_temp.d(18, '13:00'), 'low', true, false, true,
  'https://instagram.com/negev.bakery', 'photo-1509440159596-0249088772ff', null, 4);
select pg_temp.hours('negev-morning-bakery', array[0,1,2,3,4,5], '06:00', '13:00');

select pg_temp.add_popup('beer-sheva-flea-market', 'שוק פשפשים בבאר שבע',
  'עתיקות, ספרים ישנים ומציאות',
  'שוק פשפשים גדול בכל יום חמישי: עתיקות, ספרים, כלי בית ומציאות. כדאי להגיע מוקדם.',
  'markets', 'beer-sheva', 'שוק העירוני, באר שבע', 34.8000, 31.2390,
  pg_temp.d(-30, '00:00'), pg_temp.d(90, '23:59'), 'free', true, true, false,
  'https://instagram.com/b7.fleamarket', 'photo-1533900298318-6b8da08a523e', null, 30);
select pg_temp.hours('beer-sheva-flea-market', array[4], '07:00', '15:00');

-- Eilat ----------------------------------------------------------------------
select pg_temp.add_popup('eilat-swimwear-popup', 'פופ-אפ בגדי ים על הטיילת',
  'בגדי ים של מעצבות ישראליות, בהנחת סוף עונה',
  'חנות בגדי ים זמנית על הטיילת: מעצבות ישראליות, מידות מגוונות ותאי מדידה ממוזגים.',
  'fashion', 'eilat', 'הטיילת הצפונית, אילת', 34.9555, 29.5530,
  pg_temp.d(-15, '00:00'), pg_temp.d(2, '23:00'), 'medium', true, false, false,
  'https://instagram.com/eilat.swim', 'photo-1490481651871-ab68de25d43d', null, 15);
select pg_temp.hours('eilat-swimwear-popup', array[0,1,2,3,4,5,6], '10:00', '23:00');

select pg_temp.add_popup('eilat-beach-cinema', 'קולנוע פתוח על החוף',
  'סרט על המסך הגדול כל ערב, פופקורן ופופים על החול',
  'קולנוע פתוח על החוף: סרט אחר כל ערב, פופים ושמיכות על החול. הכניסה חופשית, עם כתוביות בעברית.',
  'art', 'eilat', 'חוף המלכה, אילת', 34.9620, 29.5480,
  pg_temp.d(-5, '00:00'), pg_temp.d(11, '23:59'), 'free', true, true, true,
  'https://instagram.com/eilat.beachcinema', 'photo-1489599849927-2ee91cede3ba', null, 5);
select pg_temp.hours('eilat-beach-cinema', array[0,1,2,3,4,5,6], '19:00', '23:30');

-- One pending submission (shows up in the admin approval queue, hidden from the app).
select pg_temp.add_popup('pending-candle-workshop', 'סדנת נרות בפופ-אפ',
  'יוצרים נר ריחני משלכם בחצי שעה',
  'סדנת נרות פתוחה: בוחרים ריח וצבע ויוצאים עם נר. ממתין לאישור.',
  'more', 'tel-aviv', 'נחלת בנימין 20, תל אביב-יפו', 34.7700, 32.0680,
  pg_temp.d(1, '10:00'), pg_temp.d(14, '20:00'), 'low', false, false, true,
  null, 'photo-1513364776144-60967b0f800f', null, 0);
update public.popups set status = 'pending', source = 'organizer' where slug = 'pending-candle-workshop';

-- ---------------------------------------------------------------------------
-- Sponsored placements (always labeled "ממומן" in the app)
-- ---------------------------------------------------------------------------
insert into public.promotions (popup_id, placement, starts_at, ends_at, budget_amount, status, payment_status, notes)
select p.id, pl.placement, now() - interval '2 days', p.ends_at, pl.budget, 'active', 'not_required', 'Seed promotion'
from public.popups p
join (values
  ('sneaker-drop-dizengoff', 'hot_now'::public.promotion_placement, 1500),
  ('sneaker-drop-dizengoff', 'nearby_top'::public.promotion_placement, 800),
  ('sneaker-drop-dizengoff', 'map_highlight'::public.promotion_placement, 400),
  ('emek-refaim-patisserie', 'hot_now'::public.promotion_placement, 900),
  ('emek-refaim-patisserie', 'map_highlight'::public.promotion_placement, 300)
) as pl(slug, placement, budget) on pl.slug = p.slug;

-- ---------------------------------------------------------------------------
-- A bit of activity in the last 24h so "Hot now" has a ranking from day one
-- ---------------------------------------------------------------------------
insert into public.popup_events (popup_id, event_type, session_id, surface, created_at)
select p.id, e.event_type, 'seed-' || g, 'seed', now() - (random() * interval '23 hours')
from public.popups p
join (values
  ('florentin-food-market', 120, 25, 18),
  ('port-designers-fair', 90, 30, 12),
  ('mahane-yehuda-night-market', 80, 15, 20),
  ('rothschild-taco-truck', 70, 12, 15),
  ('jaffa-street-walls', 60, 20, 6),
  ('first-station-fashion', 45, 10, 5),
  ('rishon-beach-food', 40, 8, 9),
  ('eilat-beach-cinema', 35, 9, 7),
  ('bat-galim-coffee-launch', 30, 6, 6),
  ('beer-sheva-makers-fair', 25, 5, 4)
) as a(slug, views, saves, navs) on a.slug = p.slug
cross join lateral (
  select 'view'::public.popup_event_type as event_type, generate_series(1, a.views) as g
  union all select 'save', generate_series(1, a.saves)
  union all select 'navigate', generate_series(1, a.navs)
) e;
