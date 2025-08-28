export function getRole(): 'support' | 'manager' {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  if (stored === 'support' || stored === 'manager') {
    return stored;
  }
  const envRole = process.env.NEXT_PUBLIC_ROLE;
  return envRole === 'manager' ? 'manager' : 'support';
}

export async function api(input: string, init: RequestInit = {}) {
  const headers: HeadersInit = { ...(init.headers ?? {}), 'x-role': getRole() };
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return fetch(`${base}${input}`, { ...init, headers });
}