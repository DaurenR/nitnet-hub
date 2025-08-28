export function getRole(): 'support' | 'manager' {
  return (process.env.NEXT_PUBLIC_ROLE as 'support' | 'manager') ?? 'support';
}

export async function api(input: string, init: RequestInit = {}) {
  const role = getRole();
  const headers: HeadersInit = { 'x-role': role, ...(init.headers ?? {}) };
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return fetch(`${base}${input}`, { ...init, headers });
}