import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import { ShoppingCart, User, LogOut, Package, Plus, Menu as MenuIcon, X, Search, Shield } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const query = searchParams.get('q');
    setSearchQuery(query || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleAuthNavigation = (path: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 relative overflow-visible shadow-xl shadow-slate-300/30 dark:shadow-purple-900/30 transition-shadow duration-300">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white/95 via-slate-50/90 to-white/95 dark:from-slate-950/95 dark:via-slate-900/70 dark:to-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 transition-colors duration-300"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-40%] h-64 w-64 bg-purple-500/10 dark:bg-purple-500/20 blur-[160px]" />
        <div className="absolute right-[-5%] top-[-20%] h-64 w-64 bg-pink-500/10 dark:bg-pink-500/20 blur-[180px]" />
        <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-white/40 to-transparent opacity-70" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px] relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2.5 rounded-2xl text-white transform group-hover:-translate-y-0.5 transition-all duration-300 shadow-[0_10px_30px_rgba(236,72,153,0.35)]">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-300 drop-shadow-sm">
                SnapBuy
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-slate-400">
                curated goods
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Search Bar */}
            <form 
              onSubmit={handleSearch}
              className="hidden lg:flex items-center relative group"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-[32rem] pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-slate-200 dark:focus:bg-white/10 focus:border-slate-400 dark:focus:border-white/30 focus:w-[48rem] transition-all duration-300 shadow-md dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[0_12px_32px_rgba(236,72,153,0.25)]"
                />
                <Search className="absolute left-3.5 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none group-focus-within:text-slate-700 dark:group-focus-within:text-white transition-colors" />
              </div>
            </form>

            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className={`text-sm font-medium transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:-translate-y-0.5 ${
                  isActive('/admin')
                    ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 shadow-lg shadow-purple-500/20 dark:shadow-[0_12px_32px_rgba(168,85,247,0.45)]'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Plus className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                Add Product
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => handleAuthNavigation('/cart')}
              className="relative group flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-semibold shadow-[0_14px_40px_rgba(236,72,153,0.5)] hover:shadow-[0_18px_48px_rgba(236,72,153,0.65)] hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
            >
              <span className="absolute inset-0 rounded-full bg-white/20 opacity-50 blur-2xl pointer-events-none" />
              <ShoppingCart className="w-5 h-5 text-white relative z-10" />
              <span className="hidden lg:block text-sm">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-purple-600 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border border-purple-200 shadow-lg shadow-pink-500/40 transform scale-100 transition-transform group-hover:scale-110">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="group flex items-center gap-3 px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 text-left transition-all duration-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-white/5">
                    {user?.profileImage && user.profileImage.trim() !== '' ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-white/20 shadow-md dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={user?.profileImage && user.profileImage.trim() !== '' ? 'hidden' : 'w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-slate-300 dark:border-white/20 shadow-md dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)]'}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden lg:flex flex-col max-w-[180px]">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate leading-tight mt-1">{user?.email}</span>
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-120"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-72 max-w-xs origin-top-right rounded-2xl bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-slate-950/95 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl focus:outline-none overflow-hidden">
                    {/* User info header */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {user?.profileImage && user.profileImage.trim() !== '' ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-300 dark:border-white/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={user?.profileImage && user.profileImage.trim() !== '' ? 'hidden' : 'w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-slate-300 dark:border-white/20'}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-300/70 dark:via-slate-700/70 to-transparent" />

                    {/* Menu items */}
                    <div className="py-1.5">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`group flex items-center w-full px-4 py-3 text-sm ${
                              active ? 'bg-slate-200 dark:bg-white/6 text-slate-900 dark:text-white scale-[1.02]' : 'text-slate-700 dark:text-slate-200'
                            } transition-all duration-150 ease-out`}
                          >
                            <span className="inline-flex items-center justify-center w-8">
                              <User className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </span>
                            <span className="ml-1">Profile</span>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`group flex items-center w-full px-4 py-3 text-sm ${
                              active ? 'bg-slate-200 dark:bg-white/6 text-slate-900 dark:text-white scale-[1.02]' : 'text-slate-700 dark:text-slate-200'
                            } transition-all duration-150 ease-out`}
                          >
                            <span className="inline-flex items-center justify-center w-8">
                              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </span>
                            <span className="ml-1">Settings</span>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/cart"
                            className={`group flex items-center w-full px-4 py-3 text-sm ${
                              active ? 'bg-slate-200 dark:bg-white/6 text-slate-900 dark:text-white scale-[1.02]' : 'text-slate-700 dark:text-slate-200'
                            } transition-all duration-150 ease-out`}
                          >
                            <span className="inline-flex items-center justify-center w-8">
                              <ShoppingCart className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </span>
                            <span className="ml-1">Cart</span>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`group flex items-center w-full px-4 py-3 text-sm ${
                              active ? 'bg-slate-200 dark:bg-white/6 text-slate-900 dark:text-white scale-[1.02]' : 'text-slate-700 dark:text-slate-200'
                            } transition-all duration-150 ease-out`}
                          >
                            <span className="inline-flex items-center justify-center w-8">
                              <Package className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </span>
                            <span className="ml-1">My Orders</span>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`group flex items-center w-full px-4 py-3 text-sm text-left ${
                              active ? 'bg-red-500/10 text-red-300 scale-[1.02]' : 'text-slate-200'
                            } transition-all duration-150 ease-out`}
                          >
                            <span className="inline-flex items-center justify-center w-8">
                              <LogOut className="w-4 h-4 text-red-300 group-hover:text-red-200" />
                            </span>
                            <span className="ml-1">Logout</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-[0_12px_32px_rgba(236,72,153,0.45)] transition-all duration-300 hover:-translate-y-0.5 border border-white/10"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">


            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 focus:outline-none transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700 dark:text-slate-200" />
              ) : (
                <MenuIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_18px_40px_rgba(0,0,0,0.7)] transition-colors duration-300">
          <div className="px-2 pt-3 pb-4 space-y-2 sm:px-4">
            <form onSubmit={handleSearch} className="px-4 py-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-slate-200 dark:focus:bg-white/10 focus:border-slate-400 dark:focus:border-white/30 transition-all"
                />
                <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
            </form>
            <Link
              to="/"
              className="block px-4 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className="block w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Add Product
              </button>
            )}
            <button
              onClick={() => handleAuthNavigation('/cart')}
              className="block w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Cart ({getTotalItems()})
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="block px-4 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 text-center shadow-[0_10px_30px_rgba(236,72,153,0.4)] border border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
