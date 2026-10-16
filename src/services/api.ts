/**
 * Universal authenticated fetch helper that includes session credentials
 * and Bearer tokens for seamless cross-iframe authentication.
 * Automatically clears stale expired tokens when 401 session errors occur.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('lifelink_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401 && token) {
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      if (data.error && (data.error.includes('session') || data.error.includes('expired') || data.error.includes('Authentication required'))) {
        localStorage.removeItem('lifelink_token');
      }
    } catch {
      // ignore
    }
  }

  return response;
}
