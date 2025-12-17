export { apiRoutes } from "./routes";

export { appContract } from "./app/app.contract";
export { healthContract } from "./health/health.contract";
export { authContract } from "./auth/auth.contract";

export { organizationsContract } from "./organizations/organizations.contract";
export { organizationUsersContract } from "./organizations/users/users.contract";

export { organizationOperatorsContract } from "./organizations/operators/operators.contract";
export { organizationClientsContract } from "./organizations/clients/clients.contract";
export { organizationContractsContract } from "./organizations/contracts/contracts.contract";

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
