export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 统一的 API 响应接口
 * 用于成功和错误响应的统一格式
 * - 成功时：data 包含响应数据
 * - 错误时：data 包含错误详情（如验证错误列表、错误消息等）
 */
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  timestamp: string;
  requestId: string;
  data?: T;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}


export class BaseDto {
  createdAt?: Date;
  updatedAt?: Date;
}