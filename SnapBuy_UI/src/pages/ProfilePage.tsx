import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart, User, Mail, Shield, Package, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { OrderResponse } from '../types';
import { orderAPI } from '../services/api';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user?.id) {
        setLoadingOrders(false);
        return;
      }
      try {
        setLoadingOrders(true);
        setOrdersError(null);
        const response = await orderAPI.getAll();
        const allOrders = response.data || [];
        const userOrders = allOrders.filter((order) => order.userId === user.id);
        const sorted = [...userOrders].sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        setOrders(sorted.slice(0, 3));
      } catch (e) {
        console.error('Failed to load recent orders', e);
        setOrdersError('Unable to load recent orders right now.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="glass-enhanced max-w-md w-full mx-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
          <p className="text-slate-200 mb-4 text-lg font-semibold">You’re not logged in.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-semibold shadow-[0_12px_32px_rgba(236,72,153,0.5)] hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Profile
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Manage your SnapBuy account, preferences, and cart in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({getTotalItems()})
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 hover:border-red-400 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
          {/* User details card */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {user.profileImage && user.profileImage.trim() !== '' ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={user.profileImage && user.profileImage.trim() !== '' ? 'hidden' : 'w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-white/20'}>
                <User className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-white truncate">{user.name}</p>
                <p className="text-sm text-slate-400 truncate mt-0.5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </p>
                {user.roles && user.roles.length > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200">
                    <Shield className="w-3 h-3" />
                    {user.roles.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Cart summary card */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-200" />
                Cart overview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Quickly review your active items and jump into checkout.
              </p>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-200">
              <p>
                Items in cart:{' '}
                <span className="font-semibold text-white">{getTotalItems()}</span>
              </p>
              <p>
                Estimated total:{' '}
                <span className="font-semibold text-white">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </p>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(236,72,153,0.55)] hover:-translate-y-0.5 transition-all duration-200 border border-white/10"
            >
              Open Cart
            </button>
          </section>
        </div>

        {/* Recent orders section */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-200" />
                Recent orders
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                A quick snapshot of your latest purchases.
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10 hover:border-white/30 transition-all duration-150"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loadingOrders ? (
            <div className="mt-2 space-y-3">
              <div className="h-16 rounded-2xl bg-slate-800/80 animate-pulse" />
              <div className="h-16 rounded-2xl bg-slate-800/80 animate-pulse" />
            </div>
          ) : ordersError ? (
            <p className="mt-2 text-sm text-red-300">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              You haven&apos;t placed any orders yet. Once you do, they&apos;ll show up here.
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {orders.map((order) => {
                const itemsCount = order.items.length;
                const total = order.items.reduce(
                  (sum, item) => sum + (item.totalPrice ?? 0),
                  0
                );
                return (
                  <button
                    key={order.orderId}
                    onClick={() => navigate('/orders')}
                    className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/5 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                        #{order.orderId}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        ${total.toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">
                        {order.status}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;


