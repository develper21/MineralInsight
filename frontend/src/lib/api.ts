import { config } from '@/lib/config';

/**
 * Central API client for the MineralInsight backend.
 * Base URL comes from VITE_API_BASE_URL (falls back to localhost backend).
 */

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(endpoint: string, params?: QueryParams): string {
  const base = config.api.baseUrl.replace(/\/$/, '');
  const url = new URL(`${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: QueryParams } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type');
    const body = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        (typeof body === 'object' && body !== null && 'message' in (body as any) && (body as any).message) ||
        (typeof body === 'object' && body !== null && 'error' in (body as any) && (body as any).error) ||
        `Request failed with status ${response.status}`;
      const error = new Error(String(message)) as ApiError;
      error.status = response.status;
      error.details = body;
      throw error;
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: QueryParams) => request<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

/** Standard backend envelope: { success: boolean, data: T } */
export async function fetchApiData<T>(endpoint: string, params?: QueryParams): Promise<T> {
  const response = await apiClient.get<{ success: boolean; data: T }>(endpoint, params);
  return response.data;
}
