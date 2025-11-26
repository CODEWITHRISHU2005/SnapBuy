import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, User, LogOut, Package, Plus, Menu as MenuIcon, X, Sun, Moon, Search } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSearchClick = () => {
    navigate('/', { state: { focusSearch: Date.now() } });
    setIsMobileMenuOpen(false);
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
  const primaryLinks = [
    {
      label: 'Discover',
      path: '/',
    },
  ];

  const navLinkClass = (path: string) =>
    `group relative px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
      isActive(path)
        ? 'text-white bg-white/10 shadow-[0_8px_32px_rgba(168,85,247,0.35)] backdrop-blur border border-white/10'
        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 relative overflow-visible shadow-xl shadow-purple-900/30">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-slate-950/95 backdrop-blur-2xl border-b border-white/10"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-40%] h-64 w-64 bg-purple-500/20 blur-[160px]" />
        <div className="absolute right-[-5%] top-[-20%] h-64 w-64 bg-pink-500/20 blur-[180px]" />
        <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />
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
            {primaryLinks.map((link) => (
              <Link key={link.path} to={link.path} className={navLinkClass(link.path)} aria-current={isActive(link.path) ? 'page' : undefined}>
                <span>{link.label}</span>
                {isActive(link.path) && (
                  <span className="absolute inset-x-3 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-[0_0_12px_rgba(244,114,182,0.6)]" />
                )}
              </Link>
            ))}

            {/* Search CTA */}
            <button
              className="group hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-slate-200 hover:text-white hover:border-white/30 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(236,72,153,0.35)] hover:-translate-y-0.5 bg-white/5"
              aria-label="Search"
              onClick={handleSearchClick}
            >
              <Search className="w-4 h-4 text-slate-300 group-hover:text-white" />
              <span>Search</span>
            </button>

            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className={`text-sm font-medium transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:-translate-y-0.5 ${
                  isActive('/admin')
                    ? 'text-white bg-white/10 shadow-[0_12px_32px_rgba(168,85,247,0.45)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Plus className="w-4 h-4 text-slate-200" />
                Add Product
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group relative p-2 rounded-full text-slate-300 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/30 hover:shadow-[0_8px_20px_rgba(236,72,153,0.25)]"
              aria-label="Toggle Theme"
            >
              <span className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              {theme === 'light' ? <Moon className="w-5 h-5 relative text-slate-200" /> : <Sun className="w-5 h-5 relative text-slate-200" />}
            </button>

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
                  <Menu.Button className="group flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 text-left transition-all duration-300 focus:outline-none hover:bg-white/5">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col max-w-[180px]">
                      <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
                      <span className="text-xs text-slate-400 truncate leading-tight mt-1">{user?.email}</span>
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right bg-slate-900/95 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl focus:outline-none p-3 space-y-3">
                    <div className="flex items-center gap-4 px-3 py-2 rounded-2xl bg-white/5 border border-white/5">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-white/10">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-300 truncate mt-1">{user?.email}</p>
                      </div>
                    </div>

                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`${
                              active ? 'bg-white/10 text-white' : 'text-slate-200'
                            } group flex rounded-xl items-center w-full px-3 py-2 text-sm transition-colors border border-transparent hover:border-white/10`}
                          >
                            <Package className="w-4 h-4 mr-2 text-slate-300 group-hover:text-white" />
                            My Orders
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-red-500/15 text-red-300' : 'text-slate-200'
                            } group flex rounded-xl items-center w-full px-3 py-2 text-sm transition-colors border border-transparent hover:border-red-500/30`}
                          >
                            <LogOut className="w-4 h-4 mr-2 text-red-300 group-hover:text-red-200" />
                            Logout
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
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/30 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-slate-200" /> : <Sun className="w-5 h-5 text-slate-200" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 focus:outline-none transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-200" />
              ) : (
                <MenuIcon className="w-6 h-6 text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.7)]">
          <div className="px-2 pt-3 pb-4 space-y-2 sm:px-4">
            <button
              onClick={handleSearchClick}
              className="w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border border-white/5"
            >
              <Search className="w-5 h-5 text-slate-300" />
              Search Products
            </button>
            <Link
              to="/"
              className="block px-4 py-2 rounded-xl text-base font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className="block w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
              >
                Add Product
              </button>
            )}
            <button
              onClick={() => handleAuthNavigation('/cart')}
              className="block w-full text-left px-4 py-2 rounded-xl text-base font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
            >
              Cart ({getTotalItems()})
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="block px-4 py-2 rounded-xl text-base font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
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
