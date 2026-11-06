import { API_BASE } from './config';

export type Studio = {
    studio_id: string;
    name: string;
    timezone: string;
    currency: string;
    branding: { primary_color: string; logo_url: string | null};
    booking_policy: { requires_phone: boolean; cancellation_hours: number; max_seat_per_booking: number};
};

export type Course = {
    course_id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price_cents: number;
    image_url: string | null;
    level: string;
};

export type Slot = {
    slot_id: string;
    starts_at: string;
    seats_total: number;
    seats_avaible: number;
    price_cents: number;
};

export type BookingRequest = {
    slot_id: string;
    seats: number;
    notes?: string;
    customer: { first_name: string; last_name: string; email: string; phone?: string };
};

export type BookingResponse = {
    booking_id: string;
    status: string;
    confirmation_code: string;
    total_cents: number;
};

export class ApiError extends Error {
    constructor(public status: number, public code: string, public body: unknown = null) {        
        super(code);
    }
}

const scenario = new URLSearchParams(location.search).get('scenario');

function url(path: string, params: Record<string, string> = {}) {
    const u = new URL(API_BASE + path);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    if (scenario) u.searchParams.set('scenario', scenario);
    return u.toString();
}

async function request<T>(href: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
        res = await fetch(href, init);
    } catch {
        throw new ApiError(0, 'network');
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, body?.error ?? 'unknown', body);
    return body as T;
}

export const api = {
    studio: () => request<Studio>(url('/studio')),
    courses: () => request<{ courses: Course[] }>(url('/courses/')).then((r) => r.courses),
    slots: (courseId: string, from: string, to: string) =>
        request<{ slots: Slot[] }>(url(`/courses/${courseId}/slots`, { from, to })).then((r) => r.slots),

    async createBooking(payload: BookingRequest): Promise<BookingResponse> {
        try {
            return await request <BookingResponse>(url('bookings'), {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (e) {
            if (e instanceof ApiError && e.code === 'network') throw new ApiError(0, 'uncertain');
            throw e;
        }
    },
};