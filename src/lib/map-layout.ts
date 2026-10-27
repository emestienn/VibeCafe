type Point = { lat: number; lng: number };

// Projects a set of lat/lng points onto a 0-100 percentage canvas, with
// padding, so pins never sit flush against the edge of the stylized map.
export function projectPins<T extends Point>(points: T[], padding = 12) {
  if (points.length === 0) return [];

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return points.map((p) => {
    const xRaw = ((p.lng - minLng) / lngRange) * (100 - padding * 2) + padding;
    // invert y: higher latitude = further north = higher on screen
    const yRaw = (1 - (p.lat - minLat) / latRange) * (100 - padding * 2) + padding;
    return { ...p, xPct: xRaw, yPct: yRaw };
  });
}
