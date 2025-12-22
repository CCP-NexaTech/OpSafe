import { HttpStatus } from "@nestjs/common";

export function normalizeHttpException(
  responseBody: unknown,
  statusCode: number,
): { error: string; message: string; details?: any[] } {
  const fallbackError = HttpStatus[statusCode] ?? "Error";

  if (typeof responseBody === "string") {
    return { error: fallbackError, message: responseBody };
  }

  if (responseBody && typeof responseBody === "object") {
    const obj = responseBody as any;

    if (Array.isArray(obj.message)) {
      return {
        error: obj.error ?? fallbackError,
        message: "Validation failed",
        details: obj.message.map((m: any) =>
          typeof m === "string"
            ? { field: "unknown", messages: [m] }
            : m,
        ),
      };
    }

    return {
      error: obj.error ?? fallbackError,
      message: obj.message ?? "Unexpected error",
    };
  }

  return { error: fallbackError, message: "Unexpected error" };
}
