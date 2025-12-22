import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { RequestWithContext } from "../interfaces/request-with-context.interface";
import { normalizeHttpException } from "../utils/normalize-http-exception";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<RequestWithContext>();
    const res = ctx.getResponse<Response>();

    const timestamp = new Date().toISOString();
    const path = req.originalUrl ?? req.url;
    const requestId = req.requestId ?? req.header("x-request-id") ?? null;

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : null;
    const normalized = normalizeHttpException(responseBody, statusCode);

    const payload = {
      statusCode,
      error: normalized.error,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {}),
      path,
      timestamp,
      requestId,
    };

    console.error(
      JSON.stringify({
        level: "error",
        ...payload,
        method: req.method,
        userId: req.user?.sub ?? null,
        organizationId: req.user?.organizationId ?? null,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    res.status(statusCode).json(payload);
  }
}
