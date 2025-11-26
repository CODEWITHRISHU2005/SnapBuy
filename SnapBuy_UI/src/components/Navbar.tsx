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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-slate-700/50 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg text-white transform group-hover:rotate-3 transition-transform duration-300">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              SnapBuy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors duration-200 ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
            >
              Discover
            </Link>

            {/* Search Icon */}
            <button
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center ${isActive('/admin') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => handleAuthNavigation('/cart')}
              className="relative group p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300"
            >
              <ShoppingCart className={`w-6 h-6 ${isActive('/cart') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-pink-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg shadow-pink-500/50 transform scale-100 transition-transform group-hover:scale-110 animate-pulse-slow">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <span className="hidden lg:block">{user?.name}</span>
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'
                              } group flex rounded-lg items-center w-full px-2 py-2 text-sm transition-colors`}
                          >
                            <Package className="w-4 h-4 mr-2" />
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
                            className={`${active ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
                              } group flex rounded-lg items-center w-full px-2 py-2 text-sm transition-colors`}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
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
                className="px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            {user?.roles?.includes('ADMIN') && (
              <button
                onClick={() => handleAuthNavigation('/admin')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                Add Product
              </button>
            )}
            <button
              onClick={() => handleAuthNavigation('/cart')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              Cart ({getTotalItems()})
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
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
