export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  organizationId: string;

  title: string;
  content: string;

  publishedAt: string | null;

  status: PostStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreatePostInput {
  title: string;
  content: string;
  publishedAt?: string;
  status?: PostStatus;
}

export type UpdatePostInput = Partial<CreatePostInput>;
