// Removed useAuthStore import as we're using Clerk now

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  
  // Try to get Clerk token if we're in the browser
  if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    token = await (window as any).Clerk.session.getToken();
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (e) {
      // Ignore JSON parse error
    }
    
    if (response.status === 401) {
      if (typeof window !== 'undefined' && (window as any).Clerk) {
        (window as any).Clerk.signOut();
      }
    }
    
    throw new ApiError(response.status, message);
  }

  return response.json();
}
