import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            SnapBuy
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200">
              Products
            </Link>

            <Link to="/admin" className="hover:text-blue-200 bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded">
              Add Product
            </Link>

            {isAuthenticated && (
              <Link to="/orders" className="hover:text-blue-200">
                Orders
              </Link>
            )}

            <Link to="/cart" className="flex items-center hover:text-blue-200 relative">
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <User className="w-5 h-5 mr-1" />
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center hover:text-blue-200"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
