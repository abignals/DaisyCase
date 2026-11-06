import { NextRequest } from 'next/server';
import { guard, json, preflight, getScenario, sleep } from '@/lib/mock/http';
import { slotsFor } from '@/lib/mock/data';

const DAY = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
	const blocked = guard(req);
	if (blocked) return blocked;

	const { courseId } = await params;
	const sp = req.nextUrl.searchParams;
	const from = new Date(sp.get('from') ?? Date.now());
	const to = new Date(sp.get('to') ?? Date.now() + 30 * DAY);

	if (isNaN(+from) || isNaN(+to) || to < from) return json(req, { error: 'invalid_range' }, 400);
	if (+to - +from > 90 * DAY) return json(req, { error: 'window_too_large' }, 400);
	if (getScenario(req) === 'slow') await sleep(3000);

	const slots = slotsFor(courseId, from, to);
	if (!slots) return json(req, { error: 'course_not_found' }, 404);
	return json(req, { slots });
}

export const OPTIONS = preflight;