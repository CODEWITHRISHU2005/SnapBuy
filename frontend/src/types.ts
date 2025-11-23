export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageData?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  roles?: string[];
}

export interface AuthRequest {
  username: string;
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

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  items: OrderItem[];
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  createdAt: string;
}
