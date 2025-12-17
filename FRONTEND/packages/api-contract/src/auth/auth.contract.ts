import { apiRoutes } from "../routes";
import type { AuthMeResponse, LoginInput, LoginResponse } from "./auth.types";

export const authContract = {
  login: {
    method: "POST" as const,
    path: () => apiRoutes.auth.login(),
    body: {} as LoginInput,
    response: {} as LoginResponse,
  },

  me: {
    method: "GET" as const,
    path: () => apiRoutes.auth.me(),
    response: {} as AuthMeResponse,
  },
} as const;
