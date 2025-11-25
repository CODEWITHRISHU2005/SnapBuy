import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OAuth2Callback from './pages/OAuth2Callback';
import { Package } from 'lucide-react';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 800); // Wait for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'bg-slate-900'}`}>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20 animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-blob"></div>
          <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl animate-reveal-zoom">
            <Package className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white font-display tracking-tight mb-4 overflow-hidden">
          <span className="inline-block animate-elastic-slide delay-100">S</span>
          <span className="inline-block animate-elastic-slide delay-150">n</span>
          <span className="inline-block animate-elastic-slide delay-200">a</span>
          <span className="inline-block animate-elastic-slide delay-300">p</span>
          <span className="inline-block animate-elastic-slide delay-400 text-indigo-400">B</span>
          <span className="inline-block animate-elastic-slide delay-500 text-indigo-400">u</span>
          <span className="inline-block animate-elastic-slide delay-700 text-indigo-400">y</span>
        </h1>
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full animate-text-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
            <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
              <Navbar />
              <div className="pt-16">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Routes>
              </div>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
