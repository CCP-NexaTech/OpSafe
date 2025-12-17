import { apiRoutes } from "../../routes";
import type { CreatePostInput, Post, UpdatePostInput } from "./posts.types";

export const organizationPostsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.posts.list(organizationId),
    response: {} as Post[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.posts.create(organizationId),
    body: {} as CreatePostInput,
    response: {} as Post,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, postId: string) =>
      apiRoutes.organizations.posts.getById(organizationId, postId),
    response: {} as Post,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, postId: string) =>
      apiRoutes.organizations.posts.update(organizationId, postId),
    body: {} as UpdatePostInput,
    response: {} as Post,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, postId: string) =>
      apiRoutes.organizations.posts.softDelete(organizationId, postId),
    response: {} as unknown,
  },
} as const;
