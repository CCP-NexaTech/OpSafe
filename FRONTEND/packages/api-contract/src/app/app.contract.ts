import { apiRoutes } from "../routes";

export type AppRootResponse = {
  message?: string;
};

export const appContract = {
  getRoot: {
    method: "GET" as const,
    path: () => apiRoutes.root(),
    response: {} as AppRootResponse,
  },
} as const;
