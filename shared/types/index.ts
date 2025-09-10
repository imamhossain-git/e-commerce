// Shared types across all microservices

export interface User {
  id: string
  email: string
  password_hash?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  session_id: string
  user_id?: string
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  // Populated from product service
  product?: Product
}

export interface Order {
  id: number
  session_id: string
  user_id?: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  created_at: string
  // Populated from product service
  product?: Product
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HealthCheck {
  status: 'ok' | 'error'
  service: string
  timestamp: string
  database?: 'connected' | 'disconnected'
  dependencies?: Record<string, 'ok' | 'error'>
}

// Service communication interfaces
export interface ServiceConfig {
  name: string
  port: number
  host: string
  healthPath: string
}

export interface ServiceRegistry {
  [serviceName: string]: ServiceConfig
}