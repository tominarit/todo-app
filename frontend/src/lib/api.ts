const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) throw new Error('Add VITE_API_URL to your .env file')

export async function apiFetch(path: string, getToken: () => Promise<string | null>, options: RequestInit = {}) {
  const token = await getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error ?? 'Request failed')
  }

  if (res.status === 204) return null
  return res.json()
};