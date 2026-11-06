import { NextRequest } from 'next/server';
import { guard, json, preflight, getScenario, sleep } from '@/lib/mock/http';
import { courses } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
	const blocked = guard(req);
	if (blocked) return blocked;
	if (getScenario(req) === 'slow') await sleep(3000);
	return json(req, { courses });
}

export const OPTIONS = preflight;