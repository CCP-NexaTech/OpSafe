import { apiRoutes } from "../../routes";
import type {
  CreateMaintenanceOrderInput,
  MaintenanceOrder,
  UpdateMaintenanceOrderInput,
} from "./maintenance-orders.types";

export const organizationMaintenanceOrdersContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.maintenanceOrders.list(organizationId),
    response: {} as MaintenanceOrder[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.maintenanceOrders.create(organizationId),
    body: {} as CreateMaintenanceOrderInput,
    response: {} as MaintenanceOrder,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, maintenanceOrderId: string) =>
      apiRoutes.organizations.maintenanceOrders.getById(
        organizationId,
        maintenanceOrderId,
      ),
    response: {} as MaintenanceOrder,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, maintenanceOrderId: string) =>
      apiRoutes.organizations.maintenanceOrders.update(
        organizationId,
        maintenanceOrderId,
      ),
    body: {} as UpdateMaintenanceOrderInput,
    response: {} as MaintenanceOrder,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, maintenanceOrderId: string) =>
      apiRoutes.organizations.maintenanceOrders.softDelete(
        organizationId,
        maintenanceOrderId,
      ),
    response: {} as unknown,
  },
} as const;
