/**
 * lib/api-client.ts — Fetcher tipado para React Query
 */

interface ApiError extends Error {
  code:    string
  status:  number
  details?: unknown
}

class ApiClient {
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res  = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    // 204 No Content
    if (res.status === 204) return undefined as T

    const json = await res.json() as { data?: T; error?: { code: string; message: string; details?: unknown } }

    if (!res.ok) {
      const err = new Error(json.error?.message ?? 'Erro desconhecido') as ApiError
      err.code    = json.error?.code ?? 'UNKNOWN'
      err.status  = res.status
      err.details = json.error?.details
      throw err
    }

    return json.data as T
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(path, window.location.origin)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }
    return this.request<T>(url.pathname + url.search)
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient()

// ─── Query Keys centralizados ─────────────────────────────
export const queryKeys = {
  contacts:      (params?: Record<string, unknown>) => ['contacts', params] as const,
  contact:       (id: string) => ['contacts', id] as const,
  deals:         (params?: Record<string, unknown>) => ['deals', params] as const,
  deal:          (id: string) => ['deals', id] as const,
  pipeline:      (type: string) => ['pipeline', type] as const,
  activities:    (params?: Record<string, unknown>) => ['activities', params] as const,
  interactions:  (contactId: string) => ['interactions', contactId] as const,
  notifications: () => ['notifications'] as const,
  kpis:          (params?: Record<string, unknown>) => ['kpis', params] as const,
  webchatSessions: () => ['webchat-sessions'] as const,
}