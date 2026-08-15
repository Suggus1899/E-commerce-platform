export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  categoryId: string;
  images: string[];
  attributes: Record<string, string>;
  featured: boolean;
  onSale: boolean;
  isNew: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  active: boolean;
}

// Spring Data `Page<T>` shape returned by the catalog endpoints.
export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export type UserRole = "CUSTOMER" | "ADMIN";

export interface SessionUser {
  username: string;
  email: string;
  role: UserRole;
}

export interface SessionResponse {
  authenticated: boolean;
  username?: string;
  email?: string;
  role?: UserRole;
}
