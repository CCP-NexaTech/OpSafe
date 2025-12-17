import { apiRoutes } from "../routes";

export type HealthResponse = {
  status?: "ok";
  timestamp?: string;
};

export const healthContract = {
  getHealth: {
    method: "GET" as const,
    path: () => apiRoutes.health(),
    response: {} as HealthResponse,
  },
} as const;
