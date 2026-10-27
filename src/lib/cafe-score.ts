import type { NoiseLevel, CrowdLevel } from "@prisma/client";
import type { MoodKey } from "./constants";

export function noiseLevelToScore(level: NoiseLevel): number {
  switch (level) {
    case "SILENT": return 97;
    case "QUIET": return 84;
    case "MODERATE": return 60;
    case "LIVELY": return 34;
  }
}

// Returns an i18n key under the `cafe.noiseLevel` namespace — translate with
// useTranslations("cafe")(`noiseLevel.${noiseLevelI18nKey(level)}`).
export function noiseLevelI18nKey(level: NoiseLevel): string {
  switch (level) {
    case "SILENT": return "silent";
    case "QUIET": return "quiet";
    case "MODERATE": return "moderate";
    case "LIVELY": return "lively";
  }
}

// Returns an i18n key under the `cafe.crowdLevel` namespace.
export function crowdLevelI18nKey(level: CrowdLevel): string {
  switch (level) {
    case "LOW": return "low";
    case "MODERATE": return "moderate";
    case "HIGH": return "high";
  }
}

type CafeLike = {
  workScore: number;
  wifiScore: number;
  coffeeScore: number;
  aestheticScore: number;
  noiseLevel: NoiseLevel;
};

// `i18nKey` resolves under the `cafe.breakdown` namespace.
export function vibeBreakdown(cafe: CafeLike) {
  return [
    { i18nKey: "work", value: cafe.workScore },
    { i18nKey: "wifi", value: cafe.wifiScore },
    { i18nKey: "quietness", value: noiseLevelToScore(cafe.noiseLevel) },
    { i18nKey: "coffee", value: cafe.coffeeScore },
    { i18nKey: "aesthetic", value: cafe.aestheticScore },
  ];
}

const MOOD_WEIGHTS: Record<MoodKey, (c: {
  workScore: number;
  studyScore: number;
  networkingScore: number;
  aestheticScore: number;
  wifiScore: number;
  noiseLevel: NoiseLevel;
  isOpenLate: boolean;
}) => number> = {
  DEEP_WORK: (c) => c.workScore * 0.5 + c.wifiScore * 0.3 + noiseLevelToScore(c.noiseLevel) * 0.2,
  STUDY: (c) => c.studyScore * 0.55 + noiseLevelToScore(c.noiseLevel) * 0.35 + c.wifiScore * 0.1,
  CODING: (c) => c.wifiScore * 0.45 + c.workScore * 0.35 + noiseLevelToScore(c.noiseLevel) * 0.2,
  CREATIVE: (c) => c.aestheticScore * 0.5 + c.workScore * 0.3 + c.networkingScore * 0.2,
  NETWORKING: (c) => c.networkingScore * 0.7 + c.aestheticScore * 0.3,
  QUIET_FOCUS: (c) => noiseLevelToScore(c.noiseLevel) * 0.6 + c.workScore * 0.4,
  SOCIAL: (c) => c.networkingScore * 0.4 + (100 - noiseLevelToScore(c.noiseLevel)) * 0.3 + c.aestheticScore * 0.3,
  AESTHETIC: (c) => c.aestheticScore * 0.85 + c.networkingScore * 0.15,
  LATE_NIGHT: (c) => (c.isOpenLate ? 100 : 20) * 0.6 + c.aestheticScore * 0.4,
  RELAX: (c) => c.aestheticScore * 0.4 + noiseLevelToScore(c.noiseLevel) * 0.4 + c.workScore * 0.2,
};

export function moodMatchScore(
  cafe: {
    workScore: number;
    studyScore: number;
    networkingScore: number;
    aestheticScore: number;
    wifiScore: number;
    noiseLevel: NoiseLevel;
    isOpenLate: boolean;
  },
  moods: MoodKey[],
): number {
  if (moods.length === 0) return cafe.workScore;
  const total = moods.reduce((sum, mood) => sum + MOOD_WEIGHTS[mood](cafe), 0);
  return Math.round(total / moods.length);
}

type HighlightCafe = {
  wifiScore: number;
  workScore: number;
  studyScore: number;
  networkingScore: number;
  aestheticScore: number;
  noiseLevel: NoiseLevel;
  isOpenLate: boolean;
  hasOutdoorSeating: boolean;
};

export function deriveHighlightTags(cafe: HighlightCafe): string[] {
  const tags: string[] = [];
  if (cafe.wifiScore >= 90) tags.push("Fast Wi-Fi");
  if (cafe.noiseLevel === "SILENT" || cafe.noiseLevel === "QUIET") tags.push("Quiet");
  if (cafe.workScore >= 88) tags.push("Good for coding");
  if (cafe.studyScore >= 88) tags.push("Great for studying");
  if (cafe.networkingScore >= 85) tags.push("Networking hub");
  if (cafe.aestheticScore >= 90) tags.push("Aesthetic");
  if (cafe.isOpenLate) tags.push("Open late");
  if (cafe.hasOutdoorSeating) tags.push("Outdoor seating");
  return tags.slice(0, 3);
}

export function rankByMood<T extends Parameters<typeof moodMatchScore>[0]>(
  cafes: T[],
  moods: MoodKey[],
) {
  return [...cafes]
    .map((cafe) => ({ cafe, score: moodMatchScore(cafe, moods) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.cafe);
}

type WhyCafe = {
  workScore: number;
  wifiScore: number;
  outletsScore: number;
  coffeeScore: number;
  seatingComfortScore: number;
  aestheticScore: number;
  networkingScore: number;
  studyScore: number;
  noiseLevel: NoiseLevel;
  crowdLevel: CrowdLevel;
};

export function whyPeopleComeHere(cafe: WhyCafe): string[] {
  const reasons: string[] = [];
  if (cafe.workScore >= 85) reasons.push("Great for deep, focused work");
  if (cafe.wifiScore >= 90) reasons.push("Fast, reliable Wi-Fi");
  if (cafe.outletsScore >= 85) reasons.push("Plenty of power outlets");
  if (cafe.noiseLevel === "SILENT" || cafe.noiseLevel === "QUIET") reasons.push("Quiet, low-distraction atmosphere");
  if (cafe.seatingComfortScore >= 85) reasons.push("Comfortable seating for long stays");
  if (cafe.coffeeScore >= 85) reasons.push("Coffee worth the trip on its own");
  if (cafe.aestheticScore >= 88) reasons.push("Beautifully designed space");
  if (cafe.networkingScore >= 80) reasons.push("A natural spot to meet other people working nearby");
  if (cafe.studyScore >= 88) reasons.push("Ideal for long study sessions");
  if (cafe.crowdLevel === "LOW") reasons.push("Rarely crowded, easy to find a table");
  return reasons.slice(0, 5);
}

export function interestOverlap(a: string[], b: string[]) {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.filter((i) => setB.has(i.toLowerCase()));
}

export function interestMatchPercent(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;
  const shared = interestOverlap(a, b).length;
  const union = new Set([...a, ...b].map((s) => s.toLowerCase())).size;
  const jaccard = shared / union;
  return Math.round(Math.min(100, jaccard * 160));
}
