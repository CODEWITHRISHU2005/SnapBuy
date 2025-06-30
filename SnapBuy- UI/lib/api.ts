// API utility functions for Spring Boot backend integration

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Product interface matching backend structure
export interface BackendProduct {
  id: number
  name: string
  description: string
  brand: string
  price: number // Backend sends as number
  category: string
  releaseDate: string
  productAvailable: boolean
  stockQuantity: number
  imageName?: string
  imageType?: string
  imageData?: string // Base64 encoded image data
}

// Frontend product interface
export interface Product {
  id: number
  name: string
  brand: string
  price: number
  image: string
  description: string
  rating: number
  reviews: number
  category: string
  stock: number
  variants?: Array<{
    id: number
    type: string
    name: string
    value: string
    priceModifier?: number
    available: boolean
  }>
  createdAt: string
  updatedAt: string
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private getAuthHeaders(): HeadersInit {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
    return {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const headers = {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers,
      }

      console.log(`Making API request to: ${url}`)

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Convert backend product to frontend format
  private convertProduct(backendProduct: BackendProduct): Product {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      brand: backendProduct.brand,
      price: Number(backendProduct.price),
      image: backendProduct.imageData 
        ? `data:${backendProduct.imageType};base64,${backendProduct.imageData}`
        : `/placeholder.svg?height=400&width=400`,
      description: backendProduct.description,
      rating: 4.5, // Default rating - you may want to add this to backend
      reviews: Math.floor(Math.random() * 500) + 50, // Random reviews for now
      category: backendProduct.category,
      stock: backendProduct.stockQuantity,
      variants: [], // You may want to add variants to backend
      createdAt: backendProduct.releaseDate,
      updatedAt: backendProduct.releaseDate,
    }
  }

  // Product API methods
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    const response = await this.request<BackendProduct[]>(`/products${queryString}`)
    
    if (response.success && response.data) {
      const convertedProducts = response.data.map(product => this.convertProduct(product))
      return {
        success: true,
        data: convertedProducts,
      }
    }
    
    return response
  }

  async getProduct(id: number) {
    const response = await this.request<BackendProduct>(`/product/${id}`)
    
    if (response.success && response.data) {
      return {
        success: true,
        data: this.convertProduct(response.data),
      }
    }
    
    return response
  }

  async getProductImage(id: number) {
    try {
      const url = `${this.baseURL}/product/${id}/image`
      const response = await fetch(url)
      
      if (response.ok) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
      
      return "/placeholder.svg?height=400&width=400"
    } catch (error) {
      console.error("Failed to fetch product image:", error)
      return "/placeholder.svg?height=400&width=400"
    }
  }

  async createProduct(productData: FormData) {
    return this.request("/product", {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: productData,
    })
  }

  async updateProduct(id: number, productData: FormData) {
    return this.request(`/product/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: productData,
    })
  }

  async deleteProduct(id: number) {
    return this.request(`/product/${id}`, {
      method: "DELETE",
    })
  }

  async searchProducts(keyword: string) {
    const response = await this.request<BackendProduct[]>(`/products/search?keyword=${encodeURIComponent(keyword)}`)
    
    if (response.success && response.data) {
      const convertedProducts = response.data.map(product => this.convertProduct(product))
      return {
        success: true,
        data: convertedProducts,
      }
    }
    
    return response
  }

  // Placeholder methods for features not yet implemented in backend
  async getPromotionalBanners() {
    // Return mock data until backend implements this
    return {
      success: true,
      data: {
        banners: []
      }
    }
  }

  async getFeaturedSections() {
    // Return mock data until backend implements this
    return {
      success: true,
      data: {
        sections: []
      }
    }
  }

  // Cart API methods (placeholder - implement when backend is ready)
  async getCart() {
    return { success: true, data: { items: [] } }
  }

  async addToCart(productId: number, quantity: number, variants?: any) {
    return { success: true, data: { message: "Added to cart locally" } }
  }

  async updateCartItem(itemId: number, quantity: number) {
    return { success: true, data: { message: "Updated cart locally" } }
  }

  async removeFromCart(itemId: number) {
    return { success: true, data: { message: "Removed from cart locally" } }
  }

  async clearCart() {
    return { success: true, data: { message: "Cleared cart locally" } }
  }

  // Wishlist API methods (placeholder)
  async getWishlist() {
    return { success: true, data: { items: [] } }
  }

  async addToWishlist(productId: number) {
    return { success: true, data: { message: "Added to wishlist locally" } }
  }

  async removeFromWishlist(productId: number) {
    return { success: true, data: { message: "Removed from wishlist locally" } }
  }

  async clearWishlist() {
    return { success: true, data: { message: "Cleared wishlist locally" } }
  }
}

export const apiClient = new ApiClient()

// Utility functions for common API operations
export const productApi = {
  getAll: (filters?: any) => apiClient.getProducts(filters),
  getById: (id: number) => apiClient.getProduct(id),
  getImage: (id: number) => apiClient.getProductImage(id),
  create: (data: FormData) => apiClient.createProduct(data),
  update: (id: number, data: FormData) => apiClient.updateProduct(id, data),
  delete: (id: number) => apiClient.deleteProduct(id),
  search: (keyword: string) => apiClient.searchProducts(keyword),
}

export const promotionApi = {
  getBanners: () => apiClient.getPromotionalBanners(),
  getFeatured: () => apiClient.getFeaturedSections(),
}

export const cartApi = {
  get: () => apiClient.getCart(),
  add: (productId: number, quantity: number, variants?: any) => apiClient.addToCart(productId, quantity, variants),
  update: (itemId: number, quantity: number) => apiClient.updateCartItem(itemId, quantity),
  remove: (itemId: number) => apiClient.removeFromCart(itemId),
  clear: () => apiClient.clearCart(),
}

export const wishlistApi = {
  get: () => apiClient.getWishlist(),
  add: (productId: number) => apiClient.addToWishlist(productId),
  remove: (productId: number) => apiClient.removeFromWishlist(productId),
  clear: () => apiClient.clearWishlist(),
}