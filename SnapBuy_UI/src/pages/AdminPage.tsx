import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { Package, DollarSign, Tag, Layers, Calendar, FileText, Upload, Plus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  stockQuantity: number;
  releaseDate: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    brand: '',
    category: 'Electronics',
    stockQuantity: 0,
    releaseDate: new Date().toISOString().split('T')[0],
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      const productJSON = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        brand: formData.brand,
        category: formData.category,
        stockQuantity: formData.stockQuantity,
        productAvailable: true,
        releaseDate: formData.releaseDate,
      };
      const productBlob = new Blob([JSON.stringify(productJSON)], { type: 'application/json' });
      formDataToSend.append('product', productBlob);
      if (image) {
        formDataToSend.append('imageFile', image);
      }

      await productAPI.create(formDataToSend);
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setFormData({
        name: '',
        description: '',
        price: 0,
        brand: '',
        category: 'Electronics',
        stockQuantity: 0,
        releaseDate: new Date().toISOString().split('T')[0],
      });
      setImage(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white mb-6 shadow-2xl shadow-indigo-500/50 animate-float-3d">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
            Product Management
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Add new products to your inventory</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-in-top shadow-lg ${message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-success-check" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className={`glass-enhanced rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 overflow-hidden transition-all duration-500 hover:shadow-3xl ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-pulse-slow"></div>
            <h2 className="text-xl font-bold text-white flex items-center relative z-10">
              <Plus className="w-6 h-6 mr-3" />
              Add New Product
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="animate-slide-in-bottom">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Name</label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Package className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                      placeholder="e.g., Wireless Headphones"
                    />
                  </div>
                </div>

                <div className="animate-slide-in-bottom delay-100">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Brand</label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Tag className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                      placeholder="e.g., TechPro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-slide-in-bottom delay-150">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price</label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <DollarSign className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="animate-slide-in-bottom delay-200">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Stock</label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <Layers className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="animate-slide-in-bottom delay-100">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Tag className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-10 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 appearance-none cursor-pointer"
                    >
                      <option>Electronics</option>
                      <option>Accessories</option>
                      <option>Software</option>
                      <option>Hardware</option>
                      <option>Fashion</option>
                      <option>Home</option>
                      <option>Lifestyle</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="animate-slide-in-bottom delay-150">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Release Date</label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Calendar className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                    />
                  </div>
                </div>

                <div className="animate-slide-in-bottom delay-200">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 group cursor-pointer">
                    <div className="space-y-2 text-center">
                      <div className="mx-auto w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                        <Upload className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex text-sm text-slate-600 dark:text-slate-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      {image && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 animate-slide-in-top">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Selected: {image.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 animate-slide-in-bottom delay-300">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <div className="relative group input-glow">
                <div className="absolute top-3 left-3 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                  <FileText className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 resize-none"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl shadow-indigo-500/30 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40 disabled:hover:scale-100 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                ) : (
                  <span className="relative z-10 flex items-center">
                    <Sparkles className="mr-2 w-5 h-5" />
                    Add Product
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
