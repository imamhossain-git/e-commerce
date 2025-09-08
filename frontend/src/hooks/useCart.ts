import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { api } from '../utils/api';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      await loadCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await api.delete(`/cart/${productId}`);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      await loadCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    refreshCart: loadCart
  };
}