import type { Request } from "express";

export interface RequestWithContext extends Request {
  requestId?: string;
  user?: {
    sub: string;
    organizationId: string;
    role: string;
  };
}
