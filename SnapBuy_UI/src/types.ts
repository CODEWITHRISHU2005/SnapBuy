export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageData?: string;
}

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  password?: string;
  adminKey?: string;
  roles?: Role[];
  userAddress?: Address;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  email: string;
  items: OrderItemRequest[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phoneNumber: string;
}

export interface OrderItemResponse {
  productName: string;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  orderId: string;
  userId: number;
  customerName: string;
  email: string;
  status: string;
  orderDate: string;
  items: OrderItemResponse[];
}

export interface StripeRequest {
  productName: string;
  quantity: number;
  amount: number;
  currency: string;
}

export interface StripeResponse {
  sessionId?: string;
  sessionUrl?: string;
  message?: string;
  url?: string;
  status?: string;
}