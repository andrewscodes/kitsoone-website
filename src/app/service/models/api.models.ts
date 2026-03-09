// API Response models for Kitsoone AWS Lambda

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SelectedOptionResponse {
  optionName: string;
  value: string;
}

export interface ProductOptionValueResponse {
  id: string;
  value: string;
  priceModifier: number;
  displayOrder: number;
}

export interface ProductOptionResponse {
  id: string;
  name: string;
  displayOrder: number;
  values: ProductOptionValueResponse[];
}

export interface ProductAttributeResponse {
  key: string;
  value: string;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
  selectedOptions: SelectedOptionResponse[];
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  hasVariants: boolean;
  attributes: ProductAttributeResponse[];
  options: ProductOptionResponse[];
  variants: ProductVariantResponse[];
}

export interface AvailableFiltersResponse {
  categories: string[];
  connectivity: string[];
  colors: string[];
}

export interface ProductListResponse {
  products: ProductResponse[];
  availableFilters: AvailableFiltersResponse;
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
