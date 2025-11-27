import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';
import type { Product } from '../types';
import { Search, ShoppingCart, ArrowRight, Sparkles, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination and Sorting State
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const focusSearchBar = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchProducts();
    }
  }, [page, size, sortBy, sortDirection, activeCategory]);

  useEffect(() => {
    // Initial fetch handled by the dependency array above if searchQuery is empty
    // If we want to ensure it runs on mount regardless, the above covers it since initial state is set.
  }, []);

  useEffect(() => {
    const state = location.state as { focusSearch?: number } | null;
    if (state?.focusSearch) {
      focusSearchBar();
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (activeCategory === 'All') {
        const response = await productAPI.getPaginated(page, size, sortBy, sortDirection);
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        const response = await productAPI.getAll();
        setProducts(response.data);
        setTotalPages(0); // Hide pagination for specific categories as API doesn't support it yet
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (keyword: string) => {
    try {
      setLoading(true);
      const response = await productAPI.search(keyword);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    } else {
      setPage(0); // Reset to first page when clearing search
      fetchProducts();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product);
    const button = document.getElementById(`add-to-cart-${product.id}`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<span class="flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Added</span>';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
      }, 2000);
    }
  };

  const categories = ['All', 'Mobile & Accessories', 'TVs & Appliances', 'Lifestyle', 'Home & Furnitures'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <div className="absolute inset-0">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 dark:bg-purple-500/10 blur-3xl animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-200/30 dark:bg-pink-500/10 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold font-display text-slate-900 dark:text-white mb-6 leading-tight drop-shadow-sm">
                Discover the <br />
                <span className="animate-text-shimmer drop-shadow-lg">Extraordinary</span>
              </h1>
              <p className="text-xl text-slate-700 dark:text-slate-200 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-elastic-slide delay-100 font-medium">
                Explore our curated collection of premium products designed to elevate your lifestyle.
                Quality meets innovation in every item.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-elastic-slide delay-200">
                <button className="group btn-shine px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border border-indigo-400/20">
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <button className="px-8 py-4 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white font-bold shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:-translate-y-1 backdrop-blur-sm transition-all duration-300">
                  View Collections
                </button>
              </div>
            </div>
            <div className="flex-1 relative animate-float-3d perspective-1000">
              <div className="relative w-full max-w-lg mx-auto transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30 dark:opacity-40 transform translate-z-[-20px]"></div>
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
                  alt="Hero Product"
                  className="rounded-3xl shadow-2xl border-4 border-white/50 dark:border-slate-700/50 backdrop-blur-sm relative z-10 w-full object-cover aspect-[4/3]"
                />
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl animate-bounce delay-700 z-20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New Arrival</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Premium Audio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div ref={searchSectionRef} className="sticky top-20 z-30 mb-12 animate-elastic-slide delay-300">
          <div className="glass-enhanced p-6 rounded-2xl shadow-2xl border border-white/60 dark:border-slate-700/50 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
              <div className="relative w-full md:flex-1 md:max-w-2xl group flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600 font-medium input-glow shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap border border-indigo-400/30"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setActiveCategory(category); setPage(0); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg ${activeCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/50 scale-105 border border-indigo-400/30'
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-8 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 transition-all cursor-pointer hover:border-indigo-300"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="category">Category</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                  title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortDirection === 'asc' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="M11 4h4" /><path d="M11 8h7" /><path d="M11 12h10" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /><path d="M11 12h10" /><path d="M11 8h7" /><path d="M11 4h4" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700 mb-6 animate-float">
              <Search className="w-10 h-10 text-slate-400 dark:text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No products found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your search or filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="btn-ripple mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg hover:shadow-2xl dark:shadow-black/50 dark:hover:shadow-black/70 border border-slate-100 dark:border-slate-700/60 overflow-hidden transition-all duration-500 hover:-translate-y-2 animate-elastic-slide"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={product.imageData ? `data:image/jpeg;base64,${product.imageData}` : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <button
                    id={`add-to-cart-${product.id}`}
                    onClick={() => handleAddToCart(product)}
                    className="btn-ripple absolute bottom-4 right-4 p-3.5 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white hover:scale-110"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-900 dark:text-white shadow-xl border border-white/50 dark:border-slate-700/50">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1">
                      {product.name}
                    </h3>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent ml-2">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 mb-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      <span className={`w-2.5 h-2.5 rounded-full mr-2 ${product.stockQuantity > 0 ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'}`}></span>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </div>
                    <div className="flex text-yellow-400 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    id={`add-to-cart-btn-${product.id}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity === 0}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${product.stockQuantity > 0
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-indigo-400/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !searchQuery && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4 animate-fade-in">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = page + 1 - 2 + i;
                if (page < 2) pageNum = i + 1;
                if (page > totalPages - 3) pageNum = totalPages - 4 + i;

                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum - 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${page === pageNum - 1
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
