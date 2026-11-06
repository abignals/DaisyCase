import { NextRequest } from 'next/server';
import { guard, json, preflight, getScenario, sleep } from '@/lib/mock/http';
import { studio, findSlot } from '@/lib/mock/data';

export async function POST(req: NextRequest) {
	const blocked = guard(req);
	if (blocked) return blocked;

	//Imitation de la latence
	await sleep(1500 + Math.random() * 2500); 

	const body = await req.json().catch(() => null);
	const seats = Number(body?.seats ?? 1);
	if (!body?.slot_id || !body?.customer?.email) return json(req, { error: 'invalid_body' }, 400);

	const policy = studio.booking_policy;
	if (seats > policy.max_seats_per_booking) return json(req, { error: 'too_many_seats' }, 422);
	if (policy.requires_phone && !body.customer.phone) return json(req, { error: 'phone_required' }, 422);

	const scenario = getScenario(req);
	if (scenario === 'cancelled') return json(req, { error: 'slot_cancelled' }, 409);
	if (scenario === 'full') return json(req, { error: 'slot_full', available: 0 }, 409);
	if (scenario === 'partial') return json(req, { error: 'slot_full', available: 1 }, 409);

	const slot = findSlot(body.slot_id);
	if (!slot) return json(req, { error: 'slot_not_found' }, 404);
	if (slot.seats_available < seats) {
	return json(req, { error: 'slot_full', available: slot.seats_available }, 409);
	}

  	return json(req, {
    	booking_id: `bkg_${Date.now()}`,
    	status: 'confirmed',
    	confirmation_code: 'TF-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    	total_cents: slot.price_cents * seats,
  	}, 201);
}

export const OPTIONS = preflight;