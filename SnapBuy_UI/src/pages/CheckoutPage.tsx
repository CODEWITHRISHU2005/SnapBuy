import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import type { Address } from '../types';
import { CreditCard, MapPin, Truck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderRequest = {
        userId: user!.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      };

      await orderAPI.place(orderRequest);
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      const form = e.currentTarget;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`glass-enhanced rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-700/50 transition-all duration-500 hover:shadow-3xl ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4 shadow-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shipping Address</h2>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="animate-slide-in-bottom">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="block w-full px-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 input-glow"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="animate-slide-in-bottom delay-100">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="block w-full px-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 input-glow"
                      placeholder="New York"
                    />
                  </div>

                  <div className="animate-slide-in-bottom delay-150">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="block w-full px-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 input-glow"
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="animate-slide-in-bottom delay-200">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="block w-full px-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 input-glow"
                      placeholder="10001"
                    />
                  </div>

                  <div className="animate-slide-in-bottom delay-300">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                    <input
                      type="text"
                      required
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="block w-full px-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 input-glow"
                      placeholder="USA"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className={`glass-enhanced rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-700/50 transition-all duration-500 hover:shadow-3xl animate-slide-in-bottom delay-400`}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4 shadow-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
              </div>

              <div className="p-5 border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl flex items-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center mr-4 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Cash on Delivery</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Pay when you receive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 sticky top-24 transition-all duration-500 hover:shadow-3xl animate-slide-in-right`}>
              <div className="flex items-center mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={item.product.id} className={`flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 animate-slide-in-bottom`} style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.imageData ? (
                        <img
                          src={`data:image/jpeg;base64,${item.product.imageData}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 py-1">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 py-1">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4 border-2 border-red-200 dark:border-red-800 animate-slide-in-top flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="btn-ripple w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                ) : (
                  <span className="relative z-10 flex items-center">
                    Place Order
                    <CheckCircle2 className="ml-2 w-5 h-5" />
                  </span>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                <Truck className="w-3 h-3 mr-1" />
                <span>Free shipping on all orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
