// One-off, idempotent data fix: early seeds placed every café around Tashkent,
// even the Samarkand and Bukhara ones. Moves any café that sits far from its
// own city back near that city's center. Safe to run on every build: cafés
// that are already in the right city are left untouched.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Tashkent: { lat: 41.3111, lng: 69.2797 },
  Samarkand: { lat: 39.6542, lng: 66.9597 },
  Bukhara: { lat: 39.7747, lng: 64.4286 },
};

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[fix-coords] DATABASE_URL not set, skipping");
    return;
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const cafes = await prisma.cafe.findMany({ select: { id: true, slug: true, city: true, lat: true, lng: true } });
    let moved = 0;
    for (const cafe of cafes) {
      const center = CITY_CENTERS[cafe.city];
      if (!center) continue;
      const far = Math.abs(cafe.lat - center.lat) > 0.3 || Math.abs(cafe.lng - center.lng) > 0.3;
      if (!far) continue;
      const h = hash(cafe.slug);
      const lat = center.lat + (((h % 1000) / 1000) - 0.5) * 0.06;
      const lng = center.lng + ((((h >> 10) % 1000) / 1000) - 0.5) * 0.08;
      await prisma.cafe.update({ where: { id: cafe.id }, data: { lat, lng } });
      moved++;
    }
    console.log(`[fix-coords] moved ${moved} café(s) to their own city`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // Never fail the build over this data fix.
  console.error("[fix-coords] skipped:", err);
});
