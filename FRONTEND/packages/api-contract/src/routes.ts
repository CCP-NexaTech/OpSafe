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
      list: (organizationId: string) => `/organizations/${organizationId}/operators`,
      create: (organizationId: string) => `/organizations/${organizationId}/operators`,
      getById: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
      update: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
      softDelete: (organizationId: string, operatorId: string) =>
        `/organizations/${organizationId}/operators/${operatorId}`,
    },

    clients: {
      list: (organizationId: string) => `/organizations/${organizationId}/clients`,
      create: (organizationId: string) => `/organizations/${organizationId}/clients`,
      getById: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
      update: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
      softDelete: (organizationId: string, clientId: string) =>
        `/organizations/${organizationId}/clients/${clientId}`,
    },

    contracts: {
      list: (organizationId: string) => `/organizations/${organizationId}/contracts`,
      create: (organizationId: string) => `/organizations/${organizationId}/contracts`,
      getById: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
      update: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
      softDelete: (organizationId: string, contractId: string) =>
        `/organizations/${organizationId}/contracts/${contractId}`,
    },
  },

  users: {
    acceptInvite: () => `/users/accept-invite`,
  },
} as const;
