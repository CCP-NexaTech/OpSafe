import { apiRoutes } from "../../routes";
import type { CreateEquipmentInput, Equipment, UpdateEquipmentInput } from "./equipments.types";

export const organizationEquipmentsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.equipments.list(organizationId),
    response: {} as Equipment[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.equipments.create(organizationId),
    body: {} as CreateEquipmentInput,
    response: {} as Equipment,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, equipmentId: string) =>
      apiRoutes.organizations.equipments.getById(organizationId, equipmentId),
    response: {} as Equipment,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, equipmentId: string) =>
      apiRoutes.organizations.equipments.update(organizationId, equipmentId),
    body: {} as UpdateEquipmentInput,
    response: {} as Equipment,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, equipmentId: string) =>
      apiRoutes.organizations.equipments.softDelete(organizationId, equipmentId),
    response: {} as unknown,
  },
} as const;
