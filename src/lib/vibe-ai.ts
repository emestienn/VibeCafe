import { CITIES, type MoodKey } from "@/lib/constants";
import type { DiscoverFilters } from "@/lib/data/cafes";
import { deriveHighlightTags, moodMatchScore, noiseLevelToScore } from "@/lib/cafe-score";

export type AiLocale = "uz" | "ru" | "en";

// Multilingual keyword dictionaries — a user can type in any of the three
// languages regardless of the current UI locale; we merge all variants into
// one matcher rather than gating by locale, since that's what people
// actually do in practice.
const MOOD_KEYWORDS: Record<MoodKey, string[]> = {
  DEEP_WORK: [
    "deep work", "focus", "focused", "productive", "heads down", "heads-down",
    "diqqat", "chuqur ish", "samarali", "ishlashim kerak",
    "сосредоточ", "продуктив", "глубокая работа", "фокус",
  ],
  STUDY: [
    "study", "studying", "exam", "thesis", "homework", "revise", "revision",
    "o'qish", "imtihon", "diplom", "uyga vazifa",
    "учеба", "учиться", "экзамен", "диплом", "домашк",
  ],
  CODING: [
    "code", "coding", "programming", "dev", "developer", "bug", "ship",
    "kod", "dasturlash", "dasturchi", "laptopda ishla",
    "код", "кодить", "программир", "разработ", "ноутбуке",
  ],
  CREATIVE: [
    "creative", "design", "designing", "sketch", "brainstorm", "ideas",
    "ijod", "dizayn", "chizish", "g'oya",
    "творч", "дизайн", "рисова", "идеи",
  ],
  NETWORKING: [
    "network", "networking", "meet people", "meet other", "founders", "connect",
    "tanishish", "odamlar bilan", "asoschilar", "networking",
    "знакомит", "познаком", "нетворк", "основател",
  ],
  QUIET_FOCUS: [
    "quiet", "silent", "peaceful", "no noise", "low noise",
    "tinch", "sokin", "osoyishta",
    "тихо", "спокойн", "бесшумн",
  ],
  SOCIAL: [
    "social", "hang out", "hangout", "chat", "friends", "group",
    "ijtimoiy", "suhbat", "do'stlar", "guruh",
    "общени", "компани", "друз", "групп",
  ],
  AESTHETIC: [
    "aesthetic", "instagram", "instagrammable", "pretty", "photogenic", "cute",
    "estetik", "chiroyli", "fotosurat",
    "эстетич", "красив", "фото",
  ],
  LATE_NIGHT: [
    "late", "midnight", "night", "open late", "after hours",
    "tungi", "kech", "yarim tun",
    "ночь", "поздно", "полночь",
  ],
  RELAX: [
    "relax", "chill", "cozy", "unwind", "slow morning", "casual",
    "dam olish", "osoyishta", "mazali",
    "отдых", "расслаб", "уютн",
  ],
};

const WIFI_WORDS = /(wifi|wi-fi|internet|connection|wi fi|интернет|вай-?фай)/i;
const OUTLET_WORDS = /(outlet|charger|plug|power|rozetka|розетк|заряд)/i;
const CHEAP_WORDS = /(cheap|affordable|budget|inexpensive|not expensive|arzon|arzoncha|дешев|бюджет|недорог)/i;
const OUTDOOR_WORDS = /(outdoor|outside|patio|terrace|garden|ochiq havo|teras|терас|на улице|открытая)/i;
const PET_WORDS = /(pet|dog|hayvon|it olib|питомец|собак)/i;
const MEETING_WORDS = /(meeting|client|interview|uchrashuv|mijoz|встреч|клиент|собеседован)/i;
const GROUP_WORDS = /(group|team|friends|guruh|do'stlar|групп|команд|друз)/i;
const OPEN_NOW_WORDS = /(open now|right now|currently open|hozir ochiq|hoziroq|сейчас открыт|прямо сейчас)/i;
const QUIET_WORDS = /(quiet|silent|peaceful|tinch|sokin|тихо|спокойн)/i;
const TIRED_WORDS = /(tired|charchagan|charchadim|устал|усталост)/i;

export type ParsedQuery = Partial<DiscoverFilters> & {
  moods: MoodKey[];
  tired: boolean;
  durationHours?: number;
};

export function parseVibeQuery(text: string): ParsedQuery {
  const lower = text.toLowerCase();
  const moods: MoodKey[] = [];

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS) as [MoodKey, string[]][]) {
    if (keywords.some((k) => lower.includes(k))) moods.push(mood);
  }

  const filters: ParsedQuery = { moods, tired: TIRED_WORDS.test(lower) };

  if (WIFI_WORDS.test(lower)) filters.wifi = true;
  if (OUTLET_WORDS.test(lower)) filters.outlets = true;
  if (CHEAP_WORDS.test(lower)) filters.maxPrice = 2;
  if (OUTDOOR_WORDS.test(lower)) filters.outdoor = true;
  if (PET_WORDS.test(lower)) filters.petFriendly = true;
  if (MEETING_WORDS.test(lower)) filters.meetings = true;
  if (GROUP_WORDS.test(lower)) filters.groups = true;
  if (OPEN_NOW_WORDS.test(lower)) filters.openNow = true;
  if (QUIET_WORDS.test(lower)) filters.quiet = true;

  const durationMatch = lower.match(/(\d+)\s*(hour|soat|час)/);
  if (durationMatch) filters.durationHours = Number(durationMatch[1]);

  for (const city of CITIES) {
    if (lower.includes(city.toLowerCase())) filters.city = city;
  }

  // If someone says they're tired with no other signal, lean toward calm/relax.
  if (filters.tired && moods.length === 0) moods.push("RELAX");

  return filters;
}

type MatchCafe = {
  workScore: number;
  wifiScore: number;
  coffeeScore: number;
  aestheticScore: number;
  networkingScore: number;
  studyScore: number;
  noiseLevel: Parameters<typeof noiseLevelToScore>[0];
  isOpenLate: boolean;
  priceLevel: number;
  hasOutdoorSeating: boolean;
};

export function matchBreakdown(cafe: MatchCafe, filters: ParsedQuery) {
  const moodScore = filters.moods.length > 0 ? moodMatchScore(cafe, filters.moods) : cafe.workScore;
  const workScore = cafe.workScore;
  const wifiScore = cafe.wifiScore;
  const atmosphereScore = Math.round((cafe.aestheticScore + noiseLevelToScore(cafe.noiseLevel)) / 2);
  const priceScore = filters.maxPrice ? (cafe.priceLevel <= filters.maxPrice ? 95 : 55) : 85;

  const overall = Math.round(
    moodScore * 0.35 + workScore * 0.2 + wifiScore * 0.2 + atmosphereScore * 0.15 + priceScore * 0.1,
  );

  return {
    overall: Math.min(99, overall),
    mood: Math.round(moodScore),
    work: workScore,
    wifi: wifiScore,
    atmosphere: atmosphereScore,
    price: priceScore,
  };
}

const REPLY_TEMPLATES: Record<
  AiLocale,
  {
    found: (count: number, name: string, reasons: string, score: number, rating: string) => string;
    notFound: string;
  }
> = {
  uz: {
    found: (count, name, reasons, score, rating) =>
      `Siz uchun ${count} ta joy topdim ☕. Eng yaxshi tavsiya — ${name}: ${reasons}. Vibe bali ${score}, baho ${rating}★.`,
    notFound:
      "Bularning barchasiga mos keladigan joy topa olmadim — talablaringizdan birini yumshatib ko'ring, men qayta qarayman.",
  },
  ru: {
    found: (count, name, reasons, score, rating) =>
      `Нашёл ${count} подходящих мест ☕. Мой лучший выбор — ${name}: ${reasons}. Vibe score ${score}, рейтинг ${rating}★.`,
    notFound:
      "Не нашёл место, подходящее сразу под всё это — ослабьте одно из требований, и я поищу снова.",
  },
  en: {
    found: (count, name, reasons, score, rating) =>
      `I found ${count} place${count > 1 ? "s" : ""} for you ☕. My top pick is ${name}: ${reasons}. Vibe score ${score}, rated ${rating}★.`,
    notFound:
      "I couldn't find a café matching all of that at once — try relaxing one of your requirements and I'll have another look.",
  },
};

const REASON_WORDS: Record<AiLocale, Record<string, string>> = {
  uz: {
    "Fast Wi-Fi": "tez Wi-Fi",
    "Quiet": "tinch muhit",
    "Good for coding": "kodlash uchun qulay",
    "Great for studying": "o'qish uchun ajoyib",
    "Networking hub": "networking uchun qulay",
    "Aesthetic": "chiroyli interyer",
    "Open late": "kech soatgacha ochiq",
    "Outdoor seating": "tashqi o'tirish joyi",
  },
  ru: {
    "Fast Wi-Fi": "быстрый Wi-Fi",
    "Quiet": "тихая атмосфера",
    "Good for coding": "удобно для кода",
    "Great for studying": "отлично для учёбы",
    "Networking hub": "хорош для networking",
    "Aesthetic": "красивый интерьер",
    "Open late": "открыто допоздна",
    "Outdoor seating": "есть терраса",
  },
  en: {
    "Fast Wi-Fi": "fast Wi-Fi",
    "Quiet": "a quiet atmosphere",
    "Good for coding": "great for coding",
    "Great for studying": "great for studying",
    "Networking hub": "a networking hub",
    "Aesthetic": "a beautiful interior",
    "Open late": "open late",
    "Outdoor seating": "outdoor seating",
  },
};

export function buildReply(
  locale: AiLocale,
  cafes: Array<MatchCafe & { name: string; vibeScore: number; rating: number }>,
) {
  const template = REPLY_TEMPLATES[locale];
  if (cafes.length === 0) return template.notFound;

  const best = cafes[0];
  const tags = deriveHighlightTags(best as Parameters<typeof deriveHighlightTags>[0]);
  const reasonWords = REASON_WORDS[locale];
  const reasons = tags.length > 0
    ? tags.map((t) => reasonWords[t] ?? t.toLowerCase()).join(", ")
    : locale === "uz" ? "umumiy vibe bali yuqori" : locale === "ru" ? "высокий общий vibe score" : "a strong overall vibe score";

  return template.found(cafes.length, best.name, reasons, best.vibeScore, best.rating.toFixed(1));
}
