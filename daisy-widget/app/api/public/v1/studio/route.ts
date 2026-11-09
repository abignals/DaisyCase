import { NextRequest } from 'next/server';
import { guard, json, preflight, getScenario, sleep } from '@/lib/mock/http';
import { studio, demoThemes } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
  const blocked = guard(req);
  if (blocked) return blocked;
  if (getScenario(req) === 'slow') await sleep(3000);

  // Thème de démonstration (simule des réglages faits dans le back-office)
  const theme = req.nextUrl.searchParams.get('theme');
  const branding = { ...studio.branding, ...(theme ? demoThemes[theme] : {}) };
  return json(req, { ...studio, branding });
}

export const OPTIONS = preflight;