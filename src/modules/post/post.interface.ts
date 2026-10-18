import { PostStatus } from '../../../generated/prisma/enums';
import { PostWhereInput } from '../../../generated/prisma/models';

export interface ICreatePayload {
  title: string;
  content: string;
  thumbnail?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  status?: PostStatus;
  tag: string[];
}

export interface IUpdatePostPayload {
  title?: string;
  content?: string;
  thumbnail?: string;
  isFeatured?: boolean; //TODO: only admin handle it
  isPremium?: boolean;
  status?: PostStatus;
  tag?: string[];
}

export interface IPostQuery {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortOrder?: 'asc' | 'desc';
  sortBy?: string;

  title?: string;
  content?: string;
  authorId?: string;
  isFeatured?: 'true' | 'false';
  status?: PostStatus;
  tag?: string;
}
