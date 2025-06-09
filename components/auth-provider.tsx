"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("snapbuy_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("snapbuy_user")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user exists in localStorage (simulated database)
    const users = JSON.parse(localStorage.getItem("snapbuy_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (!existingUser) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    const { password: _, ...userWithoutPassword } = existingUser
    setUser(userWithoutPassword)
    setIsAuthenticated(true)
    localStorage.setItem("snapbuy_user", JSON.stringify(userWithoutPassword))
    setIsLoading(false)
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("snapbuy_users") || "[]")
    const existingUser = users.find((u: any) => u.email === userData.email)

    if (existingUser) {
      setIsLoading(false)
      throw new Error("User already exists")
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    // Save to "database"
    users.push(newUser)
    localStorage.setItem("snapbuy_users", JSON.stringify(users))

    // Log in the user
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    setIsAuthenticated(true)
    localStorage.setItem("snapbuy_user", JSON.stringify(userWithoutPassword))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("snapbuy_user")
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = { ...user, ...userData }

    // Update in "database"
    const users = JSON.parse(localStorage.getItem("snapbuy_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...userData }
      localStorage.setItem("snapbuy_users", JSON.stringify(users))
    }

    setUser(updatedUser)
    localStorage.setItem("snapbuy_user", JSON.stringify(updatedUser))
    setIsLoading(false)
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
