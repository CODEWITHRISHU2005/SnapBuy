import React, { useState, useEffect, useMemo } from 'react';
import { orderAPI } from '../services/api';
import type { OrderResponse } from '../types';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, Clock, CheckCircle2, Truck, ShoppingBag, ArrowRight, User, Mail } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = useMemo(() => {
    if (!user?.roles) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.some((role) => role === Role.ADMIN || role === `ROLE_${Role.ADMIN}`);
  }, [user?.roles]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [authLoading, isAuthenticated, navigate, isAdmin, user?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getAll();
      const allOrders = response.data || [];
      const hasUserId = typeof user?.id === 'number' && user.id > 0;
      const filteredOrders = isAdmin || !hasUserId
        ? allOrders
        : allOrders.filter((order) => order.userId === user?.id);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Unable to load your orders right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex flex-col items-center justify-center transition-colors duration-500">
        <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex flex-col items-center justify-center px-4 transition-colors duration-500">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex flex-col items-center justify-center px-4 transition-colors duration-500">
        <div className={`w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8 animate-float-3d shadow-2xl shadow-indigo-500/20 transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <Package className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className={`text-4xl font-bold font-display text-slate-900 dark:text-white mb-3 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          No Orders Yet
        </h2>
        <p className={`text-slate-600 dark:text-slate-400 mb-10 text-center max-w-md transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          You haven't placed any orders yet. Start shopping to see your order history here!
        </p>
        <Link
          to="/"
          className={`btn-ripple px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-xl shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center group transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          Start Shopping
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'PENDING':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'PROCESSING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 mr-1.5" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4 mr-1.5" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4 mr-1.5" />;
      default:
        return <Package className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <div className={`flex items-center justify-between mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <div>
            <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
              My Orders
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Track and manage your recent purchases</p>
          </div>
          <div className="hidden sm:block">
            <div className="glass-enhanced px-6 py-3 rounded-xl border border-white/60 dark:border-slate-700/50 shadow-lg text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Orders: <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1 text-lg">{orders.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order.orderId}
              className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-slide-in-bottom`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-700/50 dark:to-indigo-900/20 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order #{order.orderId}</h3>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className={`px-5 py-2 rounded-full text-sm font-bold border-2 flex items-center shadow-lg ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 mr-4">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{(item.totalPrice ?? 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                          <User className="w-5 h-5 mr-3 mt-0.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{order.customerName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">User ID: {order.userId}</p>
                          </div>
                        </div>
                        <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                          <Mail className="w-5 h-5 mr-3 mt-0.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{order.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Email associated with this order</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
