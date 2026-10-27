export type MoodKey =
  | "DEEP_WORK"
  | "STUDY"
  | "CODING"
  | "CREATIVE"
  | "NETWORKING"
  | "QUIET_FOCUS"
  | "SOCIAL"
  | "AESTHETIC"
  | "LATE_NIGHT"
  | "RELAX";

// Task-oriented moods used for café discovery/filtering. `i18nKey` points at
// the `moods.<i18nKey>` namespace in messages/*.json.
export const MOODS: { key: MoodKey; i18nKey: string; emoji: string }[] = [
  { key: "DEEP_WORK", i18nKey: "deepWork", emoji: "☕" },
  { key: "STUDY", i18nKey: "study", emoji: "📚" },
  { key: "CODING", i18nKey: "coding", emoji: "💻" },
  { key: "CREATIVE", i18nKey: "creative", emoji: "🎨" },
  { key: "NETWORKING", i18nKey: "networking", emoji: "🤝" },
  { key: "QUIET_FOCUS", i18nKey: "quietFocus", emoji: "🧘" },
  { key: "SOCIAL", i18nKey: "social", emoji: "💬" },
  { key: "AESTHETIC", i18nKey: "aesthetic", emoji: "📸" },
  { key: "LATE_NIGHT", i18nKey: "lateNight", emoji: "🌙" },
  { key: "RELAX", i18nKey: "relax", emoji: "🌿" },
];

// Personal, emotional "My Vibe" moods used for the daily homepage prompt and
// Vibe Posts. `i18nKey` points at the `vibeMoods.<i18nKey>` namespace.
export type VibeMoodKey =
  | "COZY"
  | "FOCUSED"
  | "PRODUCTIVE"
  | "CALM"
  | "CREATIVE"
  | "SOCIAL"
  | "ENERGETIC"
  | "NIGHT_OWL"
  | "TALKATIVE"
  | "PEACEFUL";

export const VIBE_MOODS: { key: VibeMoodKey; i18nKey: string; emoji: string }[] = [
  { key: "COZY", i18nKey: "cozy", emoji: "☕" },
  { key: "FOCUSED", i18nKey: "focused", emoji: "💻" },
  { key: "PRODUCTIVE", i18nKey: "productive", emoji: "📚" },
  { key: "CALM", i18nKey: "calm", emoji: "🌿" },
  { key: "CREATIVE", i18nKey: "creative", emoji: "🎨" },
  { key: "SOCIAL", i18nKey: "social", emoji: "🤝" },
  { key: "ENERGETIC", i18nKey: "energetic", emoji: "🔥" },
  { key: "NIGHT_OWL", i18nKey: "nightOwl", emoji: "🌙" },
  { key: "TALKATIVE", i18nKey: "talkative", emoji: "💬" },
  { key: "PEACEFUL", i18nKey: "peaceful", emoji: "🧘" },
];

// Maps an emotional "My Vibe" mood onto the discovery mood keys used for
// café scoring/ranking, so the homepage mood-of-the-day feeds the same
// recommendation engine as Discover.
export const VIBE_TO_MOOD: Record<VibeMoodKey, MoodKey[]> = {
  COZY: ["RELAX", "AESTHETIC"],
  FOCUSED: ["DEEP_WORK", "QUIET_FOCUS"],
  PRODUCTIVE: ["STUDY", "DEEP_WORK"],
  CALM: ["QUIET_FOCUS", "RELAX"],
  CREATIVE: ["CREATIVE"],
  SOCIAL: ["SOCIAL", "NETWORKING"],
  ENERGETIC: ["SOCIAL", "NETWORKING"],
  NIGHT_OWL: ["LATE_NIGHT"],
  TALKATIVE: ["SOCIAL"],
  PEACEFUL: ["RELAX", "QUIET_FOCUS"],
};

export const INTERESTS: string[] = [
  "React", "AI", "Startups", "Design", "UI/UX", "Photography", "Writing",
  "Product", "Marketing", "Data Science", "Web3", "Mobile Dev", "Backend",
  "DevOps", "Music", "Film", "Fitness", "Travel", "Languages", "Finance",
  "Illustration", "Branding", "Game Dev", "Open Source", "Public Speaking",
  "Coffee", "Sustainability", "Education", "E-commerce", "Hardware",
];

export const AMENITIES: { name: string; icon: string }[] = [
  { name: "Fast Wi-Fi", icon: "Wifi" },
  { name: "Power Outlets", icon: "Plug" },
  { name: "Air Conditioning", icon: "Wind" },
  { name: "Outdoor Seating", icon: "Trees" },
  { name: "Pet Friendly", icon: "Dog" },
  { name: "Wheelchair Accessible", icon: "Accessibility" },
  { name: "Parking", icon: "SquareParking" },
  { name: "Vegan Options", icon: "Leaf" },
  { name: "Private Meeting Room", icon: "Users" },
  { name: "Printing", icon: "Printer" },
  { name: "Large Tables", icon: "Rows3" },
  { name: "Natural Light", icon: "Sun" },
];

export const WORK_SESSION_CATEGORIES = [
  "Study session",
  "Coding session",
  "Startup discussion",
  "Design session",
  "Language exchange",
  "Networking",
  "Casual coffee",
] as const;

// `i18nKey` points at the `gamification.<i18nKey>` namespace.
export const BADGES: { key: string; i18nKey: string; emoji: string }[] = [
  { key: "CAFE_EXPLORER", i18nKey: "cafeExplorer", emoji: "☕" },
  { key: "AESTHETIC_HUNTER", i18nKey: "aestheticHunter", emoji: "📸" },
  { key: "TRUSTED_REVIEWER", i18nKey: "trustedReviewer", emoji: "⭐" },
  { key: "CONNECTOR", i18nKey: "connector", emoji: "🤝" },
  { key: "DEEP_WORKER", i18nKey: "deepWorker", emoji: "💻" },
  { key: "CITY_EXPLORER", i18nKey: "cityExplorer", emoji: "🌆" },
];

export const CITIES = ["Tashkent", "Samarkand", "Bukhara"] as const;

export const VIBE_POST_DRINKS = ["Iced Latte", "Cappuccino", "Cold Brew", "Flat White", "Masala Chai", "Matcha Latte", "Americano", "Hot Chocolate"];
export const VIBE_POST_MUSIC = ["Lo-fi", "Jazz", "Silence", "Ambient", "Indie", "Classical", "Podcast"];
