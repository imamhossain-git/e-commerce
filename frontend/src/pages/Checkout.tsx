import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { api } from '../utils/api'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const navigate = useNavigate()

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    try {
      setIsProcessing(true)
      
      const response = await api.post('/orders', {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      })

      setOrderId(response.id)
      setOrderComplete(true)
      clearCart()
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your order #{orderId} has been successfully placed.
          </p>
          <p className="text-gray-600 mb-8">
            You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No items to checkout</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart first</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Order</h2>
        
        <p className="text-gray-600 mb-6">
          This is a demo checkout. In a real application, you would collect payment and shipping information here.
        </p>

        <button
          onClick={handleSubmitOrder}
          disabled={isProcessing || cart.length === 0}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}