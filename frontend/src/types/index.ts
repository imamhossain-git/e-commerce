export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  product_id: number
  name: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: number
  total: number
  status: string
  created_at: string
}