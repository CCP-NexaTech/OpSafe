export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type AuthMeResponse = {
  userId: string;
  organizationId: string;
  email: string;
  roles: string[];
};
