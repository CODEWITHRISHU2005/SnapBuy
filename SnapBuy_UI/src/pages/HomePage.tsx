import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [size, setSize] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams] = useSearchParams();

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const bannerData = [
    {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      title: "Premium Footwear",
      subtitle: "New Arrival"
    },
    {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
      title: "Luxury Timepieces",
      subtitle: "Exclusive"
    },
    {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=2070&q=80",
      title: "High-Fidelity Audio",
      subtitle: "Best Seller"
    },
    {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
      title: "Modern Living",
      subtitle: "Interior Design"
    },
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      title: "Summer Collection",
      subtitle: "Trending Now"
    },
    {
      url: "https://images.unsplash.com/photo-1498049389760-14cc531298ec?q=80&w=2070&auto=format&fit=crop",
      title: "Tech Essentials",
      subtitle: "Productivity"
    }
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      searchProducts(query);
    } else {
      setSearchQuery('');
      fetchProducts();
    }
  }, [page, size, sortBy, sortDirection, activeCategory, searchParams]);

  useEffect(() => {
    // Initial fetch handled by the dependency array above if searchQuery is empty
    // If we want to ensure it runs on mount regardless, the above covers it since initial state is set.
  }, []);



  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (activeCategory === 'All') {
        // Use paginated API for 'All' category
        const response = await productAPI.getPaginated(page, size, sortBy, sortDirection);
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        // Fetch all products for specific categories (client-side filtering)
        const response = await productAPI.getAll();
        setProducts(response.data);
        setTotalPages(0); // Hide pagination for category filtering
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Clear products on error
      setTotalPages(0);
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

  // Client-side filtering for categories (when not using paginated endpoint)
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 transition-colors duration-500">
      
      {/* Categories Bar (Moved Above Banner) */}
      {/* Filter Bar (Categories, Pagination, Sorting) */}
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <div className="absolute inset-0">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 dark:bg-purple-500/10 blur-3xl animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-200/30 dark:bg-pink-500/10 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
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
                <button 
                  onClick={scrollToProducts}
                  className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:shadow-3xl hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-center border border-indigo-400/30 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 active:scale-95"
                >
                  <span className="relative z-10 flex items-center">
                    Start Shopping
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </button>
                <button 
                  onClick={() => setActiveCategory('All')}
                  className="group px-8 py-4 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white font-bold shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1.5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/10 before:to-purple-500/10 before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left active:scale-95"
                >
                  <span className="relative z-10 flex items-center">
                    View Collections
                    <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 relative animate-float-3d perspective-1000">
              <div className="relative w-full max-w-lg mx-auto transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30 dark:opacity-40 transform translate-z-[-20px]"></div>
                <img
                  src={bannerData[currentBannerIndex].url}
                  alt={bannerData[currentBannerIndex].title}
                  className="rounded-3xl shadow-2xl border-4 border-white/50 dark:border-slate-700/50 backdrop-blur-sm relative z-10 w-full object-cover aspect-[4/3] transition-opacity duration-500"
                />
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl animate-bounce delay-700 z-20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bannerData[currentBannerIndex].subtitle}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{bannerData[currentBannerIndex].title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar (Moved Below Banner) */}
      <div className="py-6 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar justify-center md:justify-start flex-1 w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { setActiveCategory(category); setPage(0); }}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow-md ${activeCategory === category
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sorting & Page Size Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            {/* Page Size Selector */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 block uppercase tracking-wider">Per Page</label>
              <select
                value={size}
                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                className="appearance-none bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm"
              >
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-[60%] w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort By Selector */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 block uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm min-w-[100px]"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="category">Category</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-[60%] w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Direction */}
            <div className="group">
               <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 block uppercase tracking-wider">Order</label>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="M11 4h4" /><path d="M11 8h7" /><path d="M11 12h10" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /><path d="M11 12h10" /><path d="M11 8h7" /><path d="M11 4h4" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        {/* Product Grid Anchor */}
        <div ref={productsSectionRef} className="scroll-mt-28" />

        {/* Filter Results Summary */}
        {!loading && (searchQuery || activeCategory !== 'All') && (
          <div className="mb-6 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-md animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-slate-700 dark:text-slate-200 font-semibold">
                {filteredProducts.length === 0 ? (
                  <span>No products found</span>
                ) : (
                  <span>
                    Showing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                    {activeCategory !== 'All' && <span> in <span className="text-purple-600 dark:text-purple-400 font-bold">{activeCategory}</span></span>}
                    {searchQuery && <span> matching <span className="text-purple-600 dark:text-purple-400 font-bold">"{searchQuery}"</span></span>}
                  </span>
                )}
              </p>
              {(searchQuery || activeCategory !== 'All') && (
                <button
                  onClick={() => { 
                    setSearchQuery(''); 
                    setActiveCategory('All'); 
                    setPage(0);
                    navigate('/'); // Clear URL query
                  }}
                  className="text-sm px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-all duration-200 hover:scale-105"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

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
              onClick={() => { 
                setSearchQuery(''); 
                setActiveCategory('All'); 
                setPage(0);
                navigate('/');
              }}
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
              className="group p-3.5 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 disabled:hover:scale-100 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
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
                      className={`w-11 h-11 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg ${page === pageNum - 1
                        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/40 scale-110 border-2 border-indigo-400/30'
                        : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 hover:text-indigo-600 dark:hover:text-indigo-400'
                        } active:scale-95`}
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
              className="group p-3.5 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 disabled:hover:scale-100 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
