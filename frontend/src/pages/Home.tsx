import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, ShoppingCart, CreditCard } from 'lucide-react';

export default function Home() {
  const features = [
    {
      name: 'Browse Products',
      description: 'Discover our curated collection of quality items',
      icon: Package,
      href: '/products'
    },
    {
      name: 'Easy Shopping',
      description: 'Add items to cart with one click',
      icon: ShoppingCart,
      href: '/products'
    },
    {
      name: 'Quick Checkout',
      description: 'Secure and fast checkout process',
      icon: CreditCard,
      href: '/products'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
          Welcome to <span className="text-blue-600">ShopNow</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover amazing products at great prices. Your one-stop shop for everything you need.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Shopping
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              to={feature.href}
              className="group bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}