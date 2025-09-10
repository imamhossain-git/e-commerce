const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

console.log('API URL:', API_URL)

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api${endpoint}`
    console.log('Making request to:', url)
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get(endpoint: string) {
    return this.request(`/api${endpoint}`, { method: 'GET' })
  }

  async post(endpoint: string, data?: any) {
    return this.request(`/api${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(`/api${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return this.request(`/api${endpoint}`, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)