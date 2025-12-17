export { apiRoutes } from "./routes";

export { appContract } from "./app/app.contract";
export { healthContract } from "./health/health.contract";
export { authContract } from "./auth/auth.contract";

export { organizationsContract } from "./organizations/organizations.contract";
export { organizationUsersContract } from "./organizations/users/users.contract";

export { organizationOperatorsContract } from "./organizations/operators/operators.contract";
export { organizationClientsContract } from "./organizations/clients/clients.contract";
export { organizationContractsContract } from "./organizations/contracts/contracts.contract";

export { organizationEquipmentTypesContract } from "./organizations/equipment-types/equipment-types.contract";
export { organizationEquipmentsContract } from "./organizations/equipments/equipments.contract";
export { organizationAssignmentsContract } from "./organizations/assignments/assignments.contract";

export { organizationTermsContract } from "./organizations/terms/terms.contract";
export { organizationPostsContract } from "./organizations/posts/posts.contract";
export { organizationCustomFieldsContract } from "./organizations/custom-fields/custom-fields.contract";

export { organizationMaintenanceOrdersContract } from "./organizations/maintenance-orders/maintenance-orders.contract";
export { organizationAlertsContract } from "./organizations/alerts/alerts.contract";
export { organizationAuditLogsContract } from "./organizations/audit-logs/audit-logs.contract";

export type { LoginInput, LoginResponse, AuthMeResponse } from "./auth/auth.types";

export type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "./organizations/organizations.types";

export type {
  OrganizationUser,
  InviteOrganizationUserInput,
  AcceptInviteInput,
  UpdateOrganizationUserInput,
} from "./organizations/users/users.types";

export type {
  Operator,
  CreateOperatorInput,
  UpdateOperatorInput,
  OperatorStatus,
} from "./organizations/operators/operators.types";

export type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientStatus,
} from "./organizations/clients/clients.types";

export type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractStatus,
} from "./organizations/contracts/contracts.types";

export type {
  EquipmentType,
  CreateEquipmentTypeInput,
  UpdateEquipmentTypeInput,
  EquipmentTypeStatus,
} from "./organizations/equipment-types/equipment-types.types";

export type {
  Equipment,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  EquipmentStatus,
} from "./organizations/equipments/equipments.types";

export type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AssignmentStatus,
} from "./organizations/assignments/assignments.types";

export type {
  Term,
  CreateTermInput,
  UpdateTermInput,
  TermStatus,
} from "./organizations/terms/terms.types";

export type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostStatus,
} from "./organizations/posts/posts.types";

export type {
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  CustomFieldStatus,
  CustomFieldDataType,
} from "./organizations/custom-fields/custom-fields.types";

export type {
  MaintenanceOrder,
  CreateMaintenanceOrderInput,
  UpdateMaintenanceOrderInput,
  MaintenanceOrderPriority,
  MaintenanceOrderStatus,
} from "./organizations/maintenance-orders/maintenance-orders.types";

export type {
  Alert,
  CreateAlertInput,
  UpdateAlertInput,
} from "./organizations/alerts/alerts.types";

export type {
  AuditLog,
  CreateAuditLogInput,
  UpdateAuditLogInput,
  AuditLogEntity,
  AuditLogAction,
} from "./organizations/audit-logs/audit-logs.types";

