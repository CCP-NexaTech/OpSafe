export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiError = {
  statusCode: number;
  message: string;
  details?: unknown;
};

export type ApiResult<TResponse> =
  | { ok: true; data: TResponse; statusCode: number }
  | { ok: false; error: ApiError; statusCode: number };

export type RequestJsonParams<TBody> = {
  baseUrl: string;
  path: string;
  method: HttpMethod;

  token?: string;
  headers?: Record<string, string>;
  body?: TBody;

  signal?: AbortSignal;
};

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function readResponseBodySafely(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (response.status === 204) {
    return null;
  }

  try {
    return isJson ? await response.json() : await response.text();
  } catch {
    return null;
  }
}

function normalizeError(response: Response, responseBody: unknown): ApiError {
  if (responseBody && typeof responseBody === "object") {
    const possibleMessage = (responseBody as { message?: unknown }).message;

    if (typeof possibleMessage === "string") {
      return {
        statusCode: response.status,
        message: possibleMessage,
        details: responseBody,
      };
    }

    if (Array.isArray(possibleMessage)) {
      return {
        statusCode: response.status,
        message: possibleMessage.join(", "),
        details: responseBody,
      };
    }
  }

  return {
    statusCode: response.status,
    message: response.statusText || "Request failed",
    details: responseBody,
  };
}

export async function requestJson<TResponse, TBody = undefined>(
  params: RequestJsonParams<TBody>,
): Promise<ApiResult<TResponse>> {
  const url = buildUrl(params.baseUrl, params.path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(params.headers ?? {}),
  };

  if (params.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  const hasBody = params.body !== undefined;
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: params.method,
      headers,
      body: hasBody ? JSON.stringify(params.body) : undefined,
      signal: params.signal,
    });
  } catch (error) {
    return {
      ok: false,
      statusCode: 0,
      error: {
        statusCode: 0,
        message: "Network error",
        details: error,
      },
    };
  }

  const responseBody = await readResponseBodySafely(response);

  if (!response.ok) {
    return {
      ok: false,
      statusCode: response.status,
      error: normalizeError(response, responseBody),
    };
  }

  return {
    ok: true,
    statusCode: response.status,
    data: responseBody as TResponse,
  };
}
