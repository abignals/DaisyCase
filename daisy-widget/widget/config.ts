const scriptSrc = (document.currentScript as HTMLScriptElement | null)?.src ?? location.href

export const API_BASE = new URL('/api/public/v1', scriptSrc).toString();

