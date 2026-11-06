export const studio = {
  studio_id: 'std_2201',
  name: 'Atelier Terre & Feu',
  timezone: 'Europe/Paris',
  currency: 'EUR',
  branding: { primary_color: '#C4643A', logo_url: null },
  booking_policy: { requires_phone: true, cancellation_hours: 48, max_seats_per_booking: 4 },
};

const NAMES = ['Tour de potier', 'Modelage à la main', 'Émaillage', 'Raku', 'Sculpture', 'Céramique pour enfants', 'Décor sur faïence'];
const LEVELS = ['debutant', 'intermediaire', 'avance'] as const;
const LONG = 'Un cours complet pour découvrir la céramique de A à Z. '.repeat(14);

export const courses = Array.from({ length: 42 }, (_, i) => ({
  course_id: `crs_${100 + i}`,
  name: `${NAMES[i % NAMES.length]} — ${LEVELS[i % 3]}`,
  description: i % 7 === 0 ? '' : i % 5 === 0 ? LONG : 'Deux heures d\u2019atelier, tout le matériel est fourni.',
  duration_minutes: [90, 120, 180][i % 3],
  price_cents: 4500 + (i % 6) * 1000,
  image_url: i % 4 === 0 ? null : `https://picsum.photos/seed/daisy${i}/600/400`,
  level: LEVELS[i % 3],
}));

function parisOffset(date: Date) {
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', timeZoneName: 'longOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')!.value;
  return tz === 'GMT' ? '+00:00' : tz.slice(3);
}

export function slotsFor(courseId: string, from: Date, to: Date) {
  const course = courses.find((c) => c.course_id === courseId);
  if (!course) return null;
  const idx = Number(courseId.slice(4));
  const slots = [];
  for (const d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay();
    if (day !== 3 && day !== 6) continue;
    const ymd = d.toISOString().slice(0, 10);
    const time = day === 6 ? '14:00:00' : '18:30:00';
    slots.push({
      slot_id: `slt_${idx}_${ymd.replaceAll('-', '')}`,
      starts_at: `${ymd}T${time}${parisOffset(new Date(`${ymd}T12:00:00Z`))}`,
      seats_total: 8,
      seats_available: (idx * 31 + d.getUTCDate() * 7) % 9,
      price_cents: course.price_cents + (day === 6 ? 1000 : 0), 
    });
  }
  return slots;
}

export function findSlot(slotId: string) {
  const m = /^slt_(\d+)_(\d{8})$/.exec(slotId);
  if (!m) return null;
  const ymd = `${m[2].slice(0, 4)}-${m[2].slice(4, 6)}-${m[2].slice(6)}`;
  const day = new Date(`${ymd}T00:00:00Z`);
  return slotsFor(`crs_${m[1]}`, day, day)?.[0] ?? null;
}