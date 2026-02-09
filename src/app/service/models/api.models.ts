// API Response models for Kitsoone AWS Lambda

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AddUserRequest {
  name?: string;
  email?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface ShowcaseItem {
  id: string | number;
  image: string;
  title?: string;
}
