import { NextRequest, NextResponse } from "next/server";

const ALLOWED = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');

export type Scenario = | 'ok '| 'slow' | 'forbidden' | 'full' | 'ratelimit' | 'error' | 'partial' | 'cancelled';

export function getScenario (req: NextRequest): Scenario {
    return (req.nextUrl.searchParams.get('scenario') as Scenario) ?? 'ok';
}

function corsHeaders(origin: string | null): Record<string, string> {
    if (!origin || ALLOWED.includes(origin)) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Method': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-type',
        Vary: 'Origin',
    };
}

export function json(req: NextRequest, body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: corsHeaders(req.headers.get('origin')) });
}

export function preflight(req: NextRequest) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export function guard(req: NextRequest): NextResponse | null {
    const origin = req.headers.get('origin');
    const scenario = getScenario(req);
    if (scenario === 'forbidden' || (origin && !ALLOWED.includes(origin))) {
        return json(req, { error: 'origin_not_allowed' }, 403);
    }
    if (scenario === 'ratelimit') return json(req, { error: 'rate_limited' }, 429);
    if (scenario === 'error') return json(req, { error: 'internal_error' }, 500);

    return null;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));