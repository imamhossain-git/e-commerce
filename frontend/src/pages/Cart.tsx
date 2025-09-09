import React from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, total, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b last:border-b-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                
                <div className="ml-6 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="ml-6 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="w-full text-blue-600 py-3 px-4 text-center block mt-3 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}