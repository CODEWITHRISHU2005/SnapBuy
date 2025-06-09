// API utility functions for backend integration

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api"
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

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Product API methods
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return this.request(`/products${queryString}`)
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}`)
  }

  async createProduct(productData: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: number, productData: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    })
  }

  // Promotions API methods
  async getPromotionalBanners() {
    return this.request("/promotions/banners")
  }

  async getFeaturedSections() {
    return this.request("/promotions/featured")
  }

  async createPromotion(promotionData: any) {
    return this.request("/promotions", {
      method: "POST",
      body: JSON.stringify(promotionData),
    })
  }

  async updatePromotion(id: number, promotionData: any) {
    return this.request(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(promotionData),
    })
  }

  async deletePromotion(id: number) {
    return this.request(`/promotions/${id}`, {
      method: "DELETE",
    })
  }

  // Banner Image Upload
  async uploadBannerImage(file: File, bannerId?: number) {
    const formData = new FormData()
    formData.append("image", file)
    if (bannerId) {
      formData.append("bannerId", bannerId.toString())
    }

    return this.request("/promotions/upload-banner", {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: formData,
    })
  }

  // Cart API methods
  async getCart() {
    return this.request("/cart")
  }

  async addToCart(productId: number, quantity: number, variants?: any) {
    return this.request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, variants }),
    })
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request(`/cart/update/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId: number) {
    return this.request(`/cart/remove/${itemId}`, {
      method: "DELETE",
    })
  }

  async clearCart() {
    return this.request("/cart/clear", {
      method: "DELETE",
    })
  }

  // Wishlist API methods
  async getWishlist() {
    return this.request("/wishlist")
  }

  async addToWishlist(productId: number) {
    return this.request("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromWishlist(productId: number) {
    return this.request(`/wishlist/remove/${productId}`, {
      method: "DELETE",
    })
  }

  async clearWishlist() {
    return this.request("/wishlist/clear", {
      method: "DELETE",
    })
  }

  // User API methods
  async getProfile() {
    return this.request("/user/profile")
  }

  async updateProfile(profileData: any) {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  // Order API methods
  async getOrders(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return this.request(`/orders${queryString}`)
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`)
  }

  async createOrder(orderData: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  // Reviews API methods
  async getProductReviews(productId: number) {
    return this.request(`/products/${productId}/reviews`)
  }

  async addReview(productId: number, reviewData: any) {
    return this.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  // Upload API methods
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append("image", file)

    return this.request("/upload/image", {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: formData,
    })
  }
}

export const apiClient = new ApiClient()

// Utility functions for common API operations
export const productApi = {
  getAll: (filters?: any) => apiClient.getProducts(filters),
  getById: (id: number) => apiClient.getProduct(id),
  create: (data: any) => apiClient.createProduct(data),
  update: (id: number, data: any) => apiClient.updateProduct(id, data),
  delete: (id: number) => apiClient.deleteProduct(id),
}

export const promotionApi = {
  getBanners: () => apiClient.getPromotionalBanners(),
  getFeatured: () => apiClient.getFeaturedSections(),
  create: (data: any) => apiClient.createPromotion(data),
  update: (id: number, data: any) => apiClient.updatePromotion(id, data),
  delete: (id: number) => apiClient.deletePromotion(id),
  uploadBannerImage: (file: File, bannerId?: number) => apiClient.uploadBannerImage(file, bannerId),
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
