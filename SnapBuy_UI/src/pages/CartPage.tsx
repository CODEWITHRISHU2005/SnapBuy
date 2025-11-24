import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex flex-col items-center justify-center px-4 transition-colors duration-500">
        <div className={`w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8 animate-float-3d shadow-2xl shadow-indigo-500/20 transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <ShoppingBag className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className={`text-4xl font-bold font-display text-slate-900 dark:text-white mb-3 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          Your Cart is Empty
        </h2>
        <p className={`text-slate-600 dark:text-slate-400 mb-10 text-center max-w-md transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          Looks like you haven't added anything to your cart yet. Explore our products and find something you love!
        </p>
        <Link
          to="/"
          className={`btn-ripple px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-xl shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center group transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Review your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.product.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-slide-in-bottom`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="w-full sm:w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 group relative">
                  {item.product.imageData ? (
                    <img
                      src={`data:image/jpeg;base64,${item.product.imageData}`}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">{item.product.description}</p>
                    <div className="mt-3">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">each</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <div className="flex items-center bg-slate-50 dark:bg-slate-700 rounded-xl p-1.5 border-2 border-slate-200 dark:border-slate-600">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-600 hover:shadow-md text-slate-600 dark:text-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-slate-900 dark:text-white text-base">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-600 hover:shadow-md text-slate-600 dark:text-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-semibold flex items-center mt-6 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Shopping Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 sticky top-24 transition-all duration-500 hover:shadow-3xl animate-slide-in-right`}>
              <div className="flex items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Summary</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 py-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 py-2">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 py-2">
                  <span>Tax</span>
                  <span className="font-semibold text-slate-900 dark:text-white">$0.00</span>
                </div>
                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="btn-ripple w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center group mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/"
                className="block text-center py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-all duration-300 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
