export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export type RequestOptions = {
  baseUrl: string
  token?: string
  signal?: AbortSignal
}

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

export async function requestJson<TResponse>(
  method: HttpMethod,
  path: string,
  options: RequestOptions,
  body?: unknown,
): Promise<ApiResult<TResponse>> {
  const response = await fetch(`${options.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: options.signal,
  })

  if (!response.ok) {
    return {
      ok: false,
      error: {
        status: response.status,
        message: await response.text().catch(() => "Request failed"),
      },
    }
  }

  const hasJson = response.headers.get("content-type")?.includes("application/json")
  const data = (hasJson ? await response.json() : undefined) as TResponse
  return { ok: true, data }
}
