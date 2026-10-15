// GENERATED from supabase/seed.sql by packages/shared/scripts/gen-demo-data.py — do not edit by hand.
/* eslint-disable */
export const DEMO_CITIES = {
  "tel-aviv": {
    "name_he": "תל אביב-יפו",
    "name_en": "Tel Aviv-Yafo"
  },
  "jerusalem": {
    "name_he": "ירושלים",
    "name_en": "Jerusalem"
  },
  "haifa": {
    "name_he": "חיפה",
    "name_en": "Haifa"
  },
  "rishon-lezion": {
    "name_he": "ראשון לציון",
    "name_en": "Rishon LeZion"
  },
  "beer-sheva": {
    "name_he": "באר שבע",
    "name_en": "Be'er Sheva"
  },
  "eilat": {
    "name_he": "אילת",
    "name_en": "Eilat"
  }
} as const;

export const DEMO_SEED = [
  {
    "slug": "florentin-food-market",
    "title": "שוק האוכל של פלורנטין",
    "short_description": "15 דוכנים של שפים צעירים, מוזיקה ובירה מקומית",
    "description": "כל ערב בשבועות הקרובים: דוכני אוכל רחוב של שפים צעירים מהשכונה, די-ג'יי מקומי ובירה מבשלות קטנות. בואו רעבים.",
    "category": "food",
    "city_slug": "tel-aviv",
    "address": "רחוב ויטל 2, תל אביב-יפו",
    "lng": 34.77,
    "lat": 32.0566,
    "starts": {
      "days": -10,
      "time": "00:00"
    },
    "ends": {
      "days": 20,
      "time": "23:59"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/florentin.foodmarket",
    "image": "photo-1555396273-367ea4eb4db5",
    "image2": "photo-1504674900247-0877df9cc836",
    "created_days_ago": 3,
    "hours": [
      {
        "weekday": 0,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 1,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 2,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 3,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 4,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 5,
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "weekday": 6,
        "opens": "12:00",
        "closes": "23:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "sneaker-drop-dizengoff",
    "title": "Sneaker Drop – פופ-אפ סניקרס",
    "short_description": "דרופ מוגבל של סניקרס במהדורה מיוחדת",
    "description": "חנות זמנית לשלושה שבועות בלבד עם מהדורות מוגבלות, אזור התאמה אישית ומבצעי השקה. כל יום מגיעה סחורה חדשה.",
    "category": "brands",
    "city_slug": "tel-aviv",
    "address": "דיזנגוף 50, תל אביב-יפו",
    "lng": 34.7752,
    "lat": 32.0754,
    "starts": {
      "days": -4,
      "time": "00:00"
    },
    "ends": {
      "days": 12,
      "time": "22:00"
    },
    "price_range": "high",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": false,
    "instagram_url": "https://instagram.com/sneakerdrop.tlv",
    "image": "photo-1542291026-7eec264c27ff",
    "image2": "photo-1556906781-9a412961c28c",
    "created_days_ago": 4,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "09:00",
        "closes": "15:00"
      },
      {
        "weekday": 6,
        "opens": "19:00",
        "closes": "23:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "port-designers-fair",
    "title": "יריד המעצבים בנמל",
    "short_description": "יותר מ-60 מעצבות ומעצבים ישראלים במקום אחד",
    "description": "בגדים, תכשיטים, קרמיקה ועיצוב לבית ישירות מהיוצרים. מחירי יריד, אווירת ים, ואפשר לשלם באשראי בכל הדוכנים.",
    "category": "fashion",
    "city_slug": "tel-aviv",
    "address": "האנגר 11, נמל תל אביב",
    "lng": 34.7739,
    "lat": 32.0972,
    "starts": {
      "days": -1,
      "time": "00:00"
    },
    "ends": {
      "days": 1,
      "time": "22:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/port.designers",
    "image": "photo-1441986300917-64674bd600d8",
    "image2": "photo-1490481651871-ab68de25d43d",
    "created_days_ago": 2,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "rothschild-taco-truck",
    "title": "טאקו מהמשאית – רוטשילד",
    "short_description": "טאקו מקסיקני אמיתי ממשאית אוכל, רק לשבועיים",
    "description": "משאית הטאקו המפורסמת חונה בשדרה. טורטיות טריות שנעשות במקום, אפשרויות טבעוניות ושתייה קרה.",
    "category": "food",
    "city_slug": "tel-aviv",
    "address": "שדרות רוטשילד 30, תל אביב-יפו",
    "lng": 34.7741,
    "lat": 32.0636,
    "starts": {
      "days": -12,
      "time": "00:00"
    },
    "ends": {
      "days": 0,
      "time": "23:00"
    },
    "price_range": "low",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/tacotruck.tlv",
    "image": "photo-1565299585323-38d6b0865b47",
    "image2": null,
    "created_days_ago": 12,
    "hours": [
      {
        "weekday": 0,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 1,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 2,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 3,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 4,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 5,
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "weekday": 6,
        "opens": "11:00",
        "closes": "23:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "jaffa-street-walls",
    "title": "קירות מדברים – תערוכת רחוב ביפו",
    "short_description": "תערוכת גרפיטי פתוחה 24/7 בסמטאות שוק הפשפשים",
    "description": "עשרה אמנים צבעו קירות בסמטאות שוק הפשפשים. מסלול הליכה של כחצי שעה, מפה בכניסה ליד מגדל השעון.",
    "category": "art",
    "city_slug": "tel-aviv",
    "address": "שוק הפשפשים, יפו",
    "lng": 34.7568,
    "lat": 32.0535,
    "starts": {
      "days": -20,
      "time": "00:00"
    },
    "ends": {
      "days": 40,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": false,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/talkingwalls.jaffa",
    "image": "photo-1460661419201-fd4cecdf8a8b",
    "image2": null,
    "created_days_ago": 20,
    "hours": [],
    "status": "approved"
  },
  {
    "slug": "sarona-vintage-market",
    "title": "שוק הוינטג' בשרונה",
    "short_description": "בגדים, תקליטים ופריטי וינטג' בסוף השבוע",
    "description": "שוק וינטג' של סוף שבוע עם עשרות דוכנים: בגדים יד שנייה, תקליטים, רהיטים קטנים ואוכל.",
    "category": "markets",
    "city_slug": "tel-aviv",
    "address": "מתחם שרונה, תל אביב-יפו",
    "lng": 34.7869,
    "lat": 32.0717,
    "starts": {
      "days": -30,
      "time": "00:00"
    },
    "ends": {
      "days": 30,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/sarona.vintage",
    "image": "photo-1488459716781-31db52582fe9",
    "image2": null,
    "created_days_ago": 30,
    "hours": [
      {
        "weekday": 4,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "09:00",
        "closes": "16:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "yarkon-kids-ceramics",
    "title": "סדנת קרמיקה לילדים בפארק",
    "short_description": "סדנה פתוחה לגילאי 4–12, בלי הרשמה מראש",
    "description": "אוהל סדנאות בפארק הירקון. כל ילד מכין כלי משלו ולוקח הביתה. כולל הצללה, ברזיות ושולחנות להורים.",
    "category": "kids",
    "city_slug": "tel-aviv",
    "address": "גני יהושע, פארק הירקון",
    "lng": 34.8094,
    "lat": 32.1006,
    "starts": {
      "days": -3,
      "time": "00:00"
    },
    "ends": {
      "days": 9,
      "time": "18:00"
    },
    "price_range": "low",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/yarkon.ceramics",
    "image": "photo-1503454537195-1dcabb73ffb9",
    "image2": null,
    "created_days_ago": 3,
    "hours": [
      {
        "weekday": 0,
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "weekday": 1,
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "weekday": 2,
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "weekday": 3,
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "weekday": 4,
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "weekday": 5,
        "opens": "09:00",
        "closes": "14:00"
      },
      {
        "weekday": 6,
        "opens": "09:00",
        "closes": "14:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "levinsky-plant-popup",
    "title": "פופ-אפ צמחים ועציצים",
    "short_description": "צמחי בית, עציצים מעוצבים וייעוץ חינם",
    "description": "חנות צמחים זמנית בשוק לוינסקי. ייעוץ חינם איזה צמח מתאים לבית שלכם, כולל צמחים לדירות חשוכות.",
    "category": "more",
    "city_slug": "tel-aviv",
    "address": "לוינסקי 41, תל אביב-יפו",
    "lng": 34.7745,
    "lat": 32.0581,
    "starts": {
      "days": -6,
      "time": "00:00"
    },
    "ends": {
      "days": 2,
      "time": "20:00"
    },
    "price_range": "low",
    "wheelchair_accessible": false,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/levinsky.plants",
    "image": "photo-1485955900006-10f4d324d411",
    "image2": null,
    "created_days_ago": 6,
    "hours": [
      {
        "weekday": 0,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 1,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 2,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 3,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 4,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 5,
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "weekday": 6,
        "opens": "09:00",
        "closes": "20:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "mahane-yehuda-night-market",
    "title": "שוק הלילה במחנה יהודה",
    "short_description": "מוזיקה חיה, אוכל רחוב ובסטות פתוחות עד מאוחר",
    "description": "בימי חמישי השוק נשאר פתוח בלילה: הופעות קטנות, דוכני אוכל מיוחדים ובסטות שמוכרות עד מאוחר.",
    "category": "markets",
    "city_slug": "jerusalem",
    "address": "שוק מחנה יהודה, ירושלים",
    "lng": 35.2123,
    "lat": 31.7849,
    "starts": {
      "days": -14,
      "time": "00:00"
    },
    "ends": {
      "days": 45,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/machne.nights",
    "image": "photo-1533900298318-6b8da08a523e",
    "image2": null,
    "created_days_ago": 14,
    "hours": [
      {
        "weekday": 4,
        "opens": "20:00",
        "closes": "02:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "first-station-fashion",
    "title": "אופנה ירושלמית בתחנה הראשונה",
    "short_description": "מעצבות ירושלמיות, קולקציית סתיו ומחירי השקה",
    "description": "שמונה מעצבות מירושלים מציגות את קולקציית הסתיו בחלל משותף. אפשר למדוד ולהזמין התאמות.",
    "category": "fashion",
    "city_slug": "jerusalem",
    "address": "התחנה הראשונה, דוד רמז 4, ירושלים",
    "lng": 35.2245,
    "lat": 31.7652,
    "starts": {
      "days": -2,
      "time": "00:00"
    },
    "ends": {
      "days": 6,
      "time": "22:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": false,
    "instagram_url": "https://instagram.com/jlm.fashion.popup",
    "image": "photo-1490481651871-ab68de25d43d",
    "image2": null,
    "created_days_ago": 2,
    "hours": [
      {
        "weekday": 0,
        "opens": "11:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "11:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "11:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "11:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "11:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "14:00"
      },
      {
        "weekday": 6,
        "opens": "19:00",
        "closes": "22:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "nachlaot-temp-gallery",
    "title": "גלריה זמנית בנחלאות",
    "short_description": "תערוכת צילום בבית אבן ישן, הכניסה חופשית",
    "description": "תערוכת צילום של צלמים צעירים על החיים בשכונה. שיחת גלריה עם האמנים בכל יום שישי ב-11:00.",
    "category": "art",
    "city_slug": "jerusalem",
    "address": "רחוב התבור 12, נחלאות, ירושלים",
    "lng": 35.2101,
    "lat": 31.7826,
    "starts": {
      "days": -8,
      "time": "00:00"
    },
    "ends": {
      "days": 15,
      "time": "21:00"
    },
    "price_range": "free",
    "wheelchair_accessible": false,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/nachlaot.gallery",
    "image": "photo-1513364776144-60967b0f800f",
    "image2": null,
    "created_days_ago": 8,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "14:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "emek-refaim-patisserie",
    "title": "קונדיטוריה בפופ-אפ – עמק רפאים",
    "short_description": "קינוחים צרפתיים של שף פטיסרי, רק החודש",
    "description": "שף קונדיטור מפריז פותח קונדיטוריה זמנית: אקלרים, טארטים ומקרונים טריים כל בוקר. מומלץ להגיע מוקדם.",
    "category": "food",
    "city_slug": "jerusalem",
    "address": "עמק רפאים 22, ירושלים",
    "lng": 35.2195,
    "lat": 31.7608,
    "starts": {
      "days": -5,
      "time": "00:00"
    },
    "ends": {
      "days": 25,
      "time": "20:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/refaim.patisserie",
    "image": "photo-1551024601-bec78aea704b",
    "image2": null,
    "created_days_ago": 1,
    "hours": [
      {
        "weekday": 0,
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "weekday": 1,
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "weekday": 2,
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "weekday": 3,
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "weekday": 4,
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "weekday": 5,
        "opens": "07:30",
        "closes": "15:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "liberty-bell-kids-games",
    "title": "פסטיבל משחקים בגן הפעמון",
    "short_description": "משחקי חצר ענקיים, מתנפחים ופינת יצירה",
    "description": "פסטיבל ילדים של סוף שבוע: שחמט ענק, מתנפחים, הפעלות ופינת יצירה. מתאים לגילאי 3–12.",
    "category": "kids",
    "city_slug": "jerusalem",
    "address": "גן הפעמון, ירושלים",
    "lng": 35.2245,
    "lat": 31.7681,
    "starts": {
      "days": -1,
      "time": "00:00"
    },
    "ends": {
      "days": 10,
      "time": "19:00"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/jlm.kids.fest",
    "image": "photo-1566140967404-b8b3932483f5",
    "image2": null,
    "created_days_ago": 1,
    "hours": [
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "17:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "17:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "german-colony-farmers-market",
    "title": "שוק האיכרים במושבה הגרמנית",
    "short_description": "ירקות, גבינות ולחם ישירות מהחקלאים",
    "description": "שוק איכרים שבועי עם חקלאים מהגליל והכרמל: ירקות עונתיים, גבינות בוטיק, לחם מחמצת ושמן זית.",
    "category": "markets",
    "city_slug": "haifa",
    "address": "שדרות בן גוריון, המושבה הגרמנית, חיפה",
    "lng": 34.989,
    "lat": 32.8193,
    "starts": {
      "days": -21,
      "time": "00:00"
    },
    "ends": {
      "days": 60,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/haifa.farmers",
    "image": "photo-1488459716781-31db52582fe9",
    "image2": null,
    "created_days_ago": 21,
    "hours": [
      {
        "weekday": 5,
        "opens": "08:00",
        "closes": "14:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "wadi-nisnas-hummus",
    "title": "חומוס של סבתא – פופ-אפ בוואדי ניסנאס",
    "short_description": "מתכון משפחתי של שלושה דורות, בצלחות חד-פעמיות מתכלות",
    "description": "מסעדה זמנית בחצר אבן בוואדי ניסנאס. חומוס, פול ומסבחה טריים, ולימונדה ביתית.",
    "category": "food",
    "city_slug": "haifa",
    "address": "וואדי ניסנאס, חיפה",
    "lng": 34.994,
    "lat": 32.816,
    "starts": {
      "days": -9,
      "time": "00:00"
    },
    "ends": {
      "days": 5,
      "time": "17:00"
    },
    "price_range": "low",
    "wheelchair_accessible": false,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/savta.hummus",
    "image": "photo-1540189549336-e6e99c3679fe",
    "image2": null,
    "created_days_ago": 9,
    "hours": [
      {
        "weekday": 0,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 1,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 2,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 3,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 4,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 5,
        "opens": "09:00",
        "closes": "17:00"
      },
      {
        "weekday": 6,
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "hadar-design-fair",
    "title": "יריד עיצוב בהדר",
    "short_description": "מעצבים מקומיים, הדפסים, תכשיטים ועיצוב לבית",
    "description": "יריד עיצוב בבניין באוהאוס משוחזר. מעצבים חיפאים מציגים ומוכרים ישירות, בלי פערי תיווך.",
    "category": "fashion",
    "city_slug": "haifa",
    "address": "רחוב הרצל 30, הדר, חיפה",
    "lng": 34.9997,
    "lat": 32.8092,
    "starts": {
      "days": 2,
      "time": "10:00"
    },
    "ends": {
      "days": 4,
      "time": "22:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/hadar.design",
    "image": "photo-1441986300917-64674bd600d8",
    "image2": null,
    "created_days_ago": 1,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "bat-galim-coffee-launch",
    "title": "השקת מותג קפה – בת גלים",
    "short_description": "טעימות חינם של פולים חדשים מול הים",
    "description": "מותג קפה ישראלי משיק תערובת חדשה: עמדת טעימות חינם, סדנאות קצרות להכנת קפה וחבילות השקה.",
    "category": "brands",
    "city_slug": "haifa",
    "address": "טיילת בת גלים, חיפה",
    "lng": 34.98,
    "lat": 32.8326,
    "starts": {
      "days": -2,
      "time": "00:00"
    },
    "ends": {
      "days": 3,
      "time": "21:00"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/coffee.launch",
    "image": "photo-1495474472287-4d71bcdd2085",
    "image2": null,
    "created_days_ago": 2,
    "hours": [
      {
        "weekday": 0,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 1,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 2,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 3,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 4,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 5,
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "weekday": 6,
        "opens": "07:00",
        "closes": "21:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "rishon-beach-food",
    "title": "שוק אוכל בחוף ראשון",
    "short_description": "אוכל רחוב, שקיעה ודי-ג'יי על החול",
    "description": "מתחם אוכל זמני על החוף עם עשרה דוכנים, שולחנות על החול והופעות קטנות בשקיעה.",
    "category": "food",
    "city_slug": "rishon-lezion",
    "address": "חוף ראשון לציון",
    "lng": 34.7428,
    "lat": 31.989,
    "starts": {
      "days": -7,
      "time": "00:00"
    },
    "ends": {
      "days": 14,
      "time": "23:59"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/rishon.beachfood",
    "image": "photo-1414235077428-338989a2e8c0",
    "image2": null,
    "created_days_ago": 7,
    "hours": [
      {
        "weekday": 0,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 1,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 2,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 3,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 4,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 5,
        "opens": "17:00",
        "closes": "00:00"
      },
      {
        "weekday": 6,
        "opens": "17:00",
        "closes": "00:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "wooden-toys-popup",
    "title": "פופ-אפ צעצועי עץ",
    "short_description": "צעצועים בעבודת יד ופינת משחק לפעוטות",
    "description": "נגר מקומי מוכר צעצועי עץ בעבודת יד. יש פינת משחק לפעוטות ואפשר להזמין חריטת שם.",
    "category": "kids",
    "city_slug": "rishon-lezion",
    "address": "רוטשילד 50, ראשון לציון",
    "lng": 34.804,
    "lat": 31.964,
    "starts": {
      "days": -3,
      "time": "00:00"
    },
    "ends": {
      "days": 1,
      "time": "19:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/wooden.toys.il",
    "image": "photo-1596461404969-9ae70f2830c1",
    "image2": null,
    "created_days_ago": 3,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "sport-collection-launch",
    "title": "השקת קולקציה – מותג ספורט",
    "short_description": "קולקציית ריצה חדשה, מדידות ומבצעי השקה",
    "description": "מותג ספורט משיק קולקציית ריצה. ריצה קבוצתית קצרה בכל ערב ב-19:00 ומבצעים למשתתפים.",
    "category": "brands",
    "city_slug": "rishon-lezion",
    "address": "קניון הזהב, ראשון לציון",
    "lng": 34.774,
    "lat": 31.99,
    "starts": {
      "days": 3,
      "time": "10:00"
    },
    "ends": {
      "days": 5,
      "time": "22:00"
    },
    "price_range": "high",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": false,
    "instagram_url": "https://instagram.com/sport.launch.il",
    "image": "photo-1556761175-5973dc0f32e7",
    "image2": null,
    "created_days_ago": 1,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "22:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "beer-sheva-makers-fair",
    "title": "יריד יוצרים בעיר העתיקה",
    "short_description": "אמנים מהנגב, סדנאות קצרות ומוזיקה",
    "description": "יריד יוצרים בעיר העתיקה של באר שבע: קדרות, אריגה, צילום ותכשיטים. סדנאות קצרות לכל המשפחה.",
    "category": "art",
    "city_slug": "beer-sheva",
    "address": "רחוב קק\"ל, העיר העתיקה, באר שבע",
    "lng": 34.788,
    "lat": 31.24,
    "starts": {
      "days": -1,
      "time": "00:00"
    },
    "ends": {
      "days": 8,
      "time": "22:00"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/negev.makers",
    "image": "photo-1513364776144-60967b0f800f",
    "image2": null,
    "created_days_ago": 1,
    "hours": [
      {
        "weekday": 0,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 1,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 2,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 3,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 4,
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "15:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "negev-morning-bakery",
    "title": "מאפיית בוקר בפופ-אפ",
    "short_description": "קרואסונים, בורקס ולחמים טריים מהטאבון",
    "description": "מאפייה זמנית בחצר בעיר העתיקה. אופים מול הקהל משש בבוקר, ומה שנגמר נגמר.",
    "category": "food",
    "city_slug": "beer-sheva",
    "address": "רחוב סמילנסקי 10, באר שבע",
    "lng": 34.793,
    "lat": 31.243,
    "starts": {
      "days": -4,
      "time": "00:00"
    },
    "ends": {
      "days": 18,
      "time": "13:00"
    },
    "price_range": "low",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/negev.bakery",
    "image": "photo-1509440159596-0249088772ff",
    "image2": null,
    "created_days_ago": 4,
    "hours": [
      {
        "weekday": 0,
        "opens": "06:00",
        "closes": "13:00"
      },
      {
        "weekday": 1,
        "opens": "06:00",
        "closes": "13:00"
      },
      {
        "weekday": 2,
        "opens": "06:00",
        "closes": "13:00"
      },
      {
        "weekday": 3,
        "opens": "06:00",
        "closes": "13:00"
      },
      {
        "weekday": 4,
        "opens": "06:00",
        "closes": "13:00"
      },
      {
        "weekday": 5,
        "opens": "06:00",
        "closes": "13:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "beer-sheva-flea-market",
    "title": "שוק פשפשים בבאר שבע",
    "short_description": "עתיקות, ספרים ישנים ומציאות",
    "description": "שוק פשפשים גדול בכל יום חמישי: עתיקות, ספרים, כלי בית ומציאות. כדאי להגיע מוקדם.",
    "category": "markets",
    "city_slug": "beer-sheva",
    "address": "שוק העירוני, באר שבע",
    "lng": 34.8,
    "lat": 31.239,
    "starts": {
      "days": -30,
      "time": "00:00"
    },
    "ends": {
      "days": 90,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": false,
    "instagram_url": "https://instagram.com/b7.fleamarket",
    "image": "photo-1533900298318-6b8da08a523e",
    "image2": null,
    "created_days_ago": 30,
    "hours": [
      {
        "weekday": 4,
        "opens": "07:00",
        "closes": "15:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "eilat-swimwear-popup",
    "title": "פופ-אפ בגדי ים על הטיילת",
    "short_description": "בגדי ים של מעצבות ישראליות, בהנחת סוף עונה",
    "description": "חנות בגדי ים זמנית על הטיילת: מעצבות ישראליות, מידות מגוונות ותאי מדידה ממוזגים.",
    "category": "fashion",
    "city_slug": "eilat",
    "address": "הטיילת הצפונית, אילת",
    "lng": 34.9555,
    "lat": 29.553,
    "starts": {
      "days": -15,
      "time": "00:00"
    },
    "ends": {
      "days": 2,
      "time": "23:00"
    },
    "price_range": "medium",
    "wheelchair_accessible": true,
    "parking_available": false,
    "kid_friendly": false,
    "instagram_url": "https://instagram.com/eilat.swim",
    "image": "photo-1490481651871-ab68de25d43d",
    "image2": null,
    "created_days_ago": 15,
    "hours": [
      {
        "weekday": 0,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 1,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 2,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 3,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 4,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 5,
        "opens": "10:00",
        "closes": "23:00"
      },
      {
        "weekday": 6,
        "opens": "10:00",
        "closes": "23:00"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "eilat-beach-cinema",
    "title": "קולנוע פתוח על החוף",
    "short_description": "סרט על המסך הגדול כל ערב, פופקורן ופופים על החול",
    "description": "קולנוע פתוח על החוף: סרט אחר כל ערב, פופים ושמיכות על החול. הכניסה חופשית, עם כתוביות בעברית.",
    "category": "art",
    "city_slug": "eilat",
    "address": "חוף המלכה, אילת",
    "lng": 34.962,
    "lat": 29.548,
    "starts": {
      "days": -5,
      "time": "00:00"
    },
    "ends": {
      "days": 11,
      "time": "23:59"
    },
    "price_range": "free",
    "wheelchair_accessible": true,
    "parking_available": true,
    "kid_friendly": true,
    "instagram_url": "https://instagram.com/eilat.beachcinema",
    "image": "photo-1489599849927-2ee91cede3ba",
    "image2": null,
    "created_days_ago": 5,
    "hours": [
      {
        "weekday": 0,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 1,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 2,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 3,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 4,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 5,
        "opens": "19:00",
        "closes": "23:30"
      },
      {
        "weekday": 6,
        "opens": "19:00",
        "closes": "23:30"
      }
    ],
    "status": "approved"
  },
  {
    "slug": "pending-candle-workshop",
    "title": "סדנת נרות בפופ-אפ",
    "short_description": "יוצרים נר ריחני משלכם בחצי שעה",
    "description": "סדנת נרות פתוחה: בוחרים ריח וצבע ויוצאים עם נר. ממתין לאישור.",
    "category": "more",
    "city_slug": "tel-aviv",
    "address": "נחלת בנימין 20, תל אביב-יפו",
    "lng": 34.77,
    "lat": 32.068,
    "starts": {
      "days": 1,
      "time": "10:00"
    },
    "ends": {
      "days": 14,
      "time": "20:00"
    },
    "price_range": "low",
    "wheelchair_accessible": false,
    "parking_available": false,
    "kid_friendly": true,
    "instagram_url": null,
    "image": "photo-1513364776144-60967b0f800f",
    "image2": null,
    "created_days_ago": 0,
    "hours": [],
    "status": "pending"
  }
];

export const DEMO_PROMOTIONS = [
  {
    "slug": "sneaker-drop-dizengoff",
    "placement": "hot_now"
  },
  {
    "slug": "sneaker-drop-dizengoff",
    "placement": "nearby_top"
  },
  {
    "slug": "sneaker-drop-dizengoff",
    "placement": "map_highlight"
  },
  {
    "slug": "emek-refaim-patisserie",
    "placement": "hot_now"
  },
  {
    "slug": "emek-refaim-patisserie",
    "placement": "map_highlight"
  }
];

export const DEMO_ACTIVITY: Record<string, { views: number; saves: number; navigations: number }> = {
  "florentin-food-market": {
    "views": 120,
    "saves": 25,
    "navigations": 18
  },
  "port-designers-fair": {
    "views": 90,
    "saves": 30,
    "navigations": 12
  },
  "mahane-yehuda-night-market": {
    "views": 80,
    "saves": 15,
    "navigations": 20
  },
  "rothschild-taco-truck": {
    "views": 70,
    "saves": 12,
    "navigations": 15
  },
  "jaffa-street-walls": {
    "views": 60,
    "saves": 20,
    "navigations": 6
  },
  "first-station-fashion": {
    "views": 45,
    "saves": 10,
    "navigations": 5
  },
  "rishon-beach-food": {
    "views": 40,
    "saves": 8,
    "navigations": 9
  },
  "eilat-beach-cinema": {
    "views": 35,
    "saves": 9,
    "navigations": 7
  },
  "bat-galim-coffee-launch": {
    "views": 30,
    "saves": 6,
    "navigations": 6
  },
  "beer-sheva-makers-fair": {
    "views": 25,
    "saves": 5,
    "navigations": 4
  }
};
