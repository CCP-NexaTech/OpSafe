export const apiRoutes = {
  root: () => `/`,
  health: () => `/health`,

  auth: {
    login: () => `/auth/login`,
    me: () => `/auth/me`,
  },

  organizations: {
    list: () => `/organizations`,
    create: () => `/organizations`,
    getById: (organizationId: string) => `/organizations/${organizationId}`,
    update: (organizationId: string) => `/organizations/${organizationId}`,
    softDelete: (organizationId: string) => `/organizations/${organizationId}`,

    users: {
      invite: (organizationId: string) =>
        `/organizations/${organizationId}/users/invite`,
      list: (organizationId: string) =>
        `/organizations/${organizationId}/users`,
      getById: (organizationId: string, userId: string) =>
        `/organizations/${organizationId}/users/${userId}`,
      update: (organizationId: string, userId: string) =>
        `/organizations/${organizationId}/users/${userId}`,
      softDelete: (organizationId: string, userId: string) =>
        `/organizations/${organizationId}/users/${userId}`,
    },

    operators: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/operators`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/operators`,
      getById: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
      update: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
      softDelete: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
    },

    clients: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/clients`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/clients`,
      getById: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
      update: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
      softDelete: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
    },

    contracts: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/contracts`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/contracts`,
      getById: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
      update: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
      softDelete: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
    },

    equipmentTypes: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/equipment-types`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/equipment-types`,
      getById: (organizationId: string, equipmentTypeId: string) =>
        `/organizations/${organizationId}/equipment-types/${equipmentTypeId}`,
      update: (organizationId: string, equipmentTypeId: string) =>
        `/organizations/${organizationId}/equipment-types/${equipmentTypeId}`,
      softDelete: (organizationId: string, equipmentTypeId: string) =>
        `/organizations/${organizationId}/equipment-types/${equipmentTypeId}`,
    },

    equipments: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/equipments`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/equipments`,
      getById: (organizationId: string, equipmentId: string) =>
        `/organizations/${organizationId}/equipments/${equipmentId}`,
      update: (organizationId: string, equipmentId: string) =>
        `/organizations/${organizationId}/equipments/${equipmentId}`,
      softDelete: (organizationId: string, equipmentId: string) =>
        `/organizations/${organizationId}/equipments/${equipmentId}`,
    },

    assignments: {
      list: (organizationId: string) =>
        `/organizations/${organizationId}/assignments`,
      create: (organizationId: string) =>
        `/organizations/${organizationId}/assignments`,
      getById: (organizationId: string, assignmentId: string) =>
        `/organizations/${organizationId}/assignments/${assignmentId}`,
      update: (organizationId: string, assignmentId: string) =>
        `/organizations/${organizationId}/assignments/${assignmentId}`,
      softDelete: (organizationId: string, assignmentId: string) =>
        `/organizations/${organizationId}/assignments/${assignmentId}`,
    },
  },

  users: {
    acceptInvite: () => `/users/accept-invite`,
  },
} as const;
