import { apiRoutes } from "../../routes";
import type {
  CreateEquipmentTypeInput,
  EquipmentType,
  UpdateEquipmentTypeInput,
} from "./equipment-types.types";

export const organizationEquipmentTypesContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.equipmentTypes.list(organizationId),
    response: {} as EquipmentType[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.equipmentTypes.create(organizationId),
    body: {} as CreateEquipmentTypeInput,
    response: {} as EquipmentType,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, equipmentTypeId: string) =>
      apiRoutes.organizations.equipmentTypes.getById(organizationId, equipmentTypeId),
    response: {} as EquipmentType,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, equipmentTypeId: string) =>
      apiRoutes.organizations.equipmentTypes.update(organizationId, equipmentTypeId),
    body: {} as UpdateEquipmentTypeInput,
    response: {} as EquipmentType,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, equipmentTypeId: string) =>
      apiRoutes.organizations.equipmentTypes.softDelete(organizationId, equipmentTypeId),
    response: {} as unknown,
  },
} as const;
