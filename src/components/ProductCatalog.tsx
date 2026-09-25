import React, { useState, useMemo } from 'react';
import {
  Filter,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Tag,
  Truck,
} from 'lucide-react';
import { HealthCategoryId, Product } from '../types';
import { HEALTH_PRODUCTS } from '../data/products';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  initialCategory?: HealthCategoryId | 'all';
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToCart,
  onSelectProduct,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Supplies' },
    { id: 'diabetes', label: 'Diabetes Care' },
    { id: 'heart', label: 'Heart Health' },
    { id: 'skin', label: 'Skin Care' },
    { id: 'women', label: "Women's Health" },
    { id: 'bone', label: 'Bone & Joint' },
    { id: 'mental', label: 'Mental & Brain' },
    { id: 'general', label: 'General Diagnostics' },
  ];

  const handleAdd = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(prod);
    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1000);
  };

  const filteredProducts = useMemo(() => {
    let list = HEALTH_PRODUCTS.filter((prod) => {
      const matchCat = selectedCategory === 'all' || prod.categoryId === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Clinical Supplies & Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Healthcare Products & Devices
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Clinically tested glucose meters, blood pressure monitors, bioavailable nutritional therapeutics, and post-consultation recovery supplies.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medical supplies..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:border-teal-600 focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="rating">Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No medical supplies found</p>
          <p className="text-xs text-slate-400 mt-1">Try relaxing your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const isAdded = !!addedIds[prod.id];
            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div>
                  {/* Photo container */}
                  <div className="aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden mb-3.5 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    {prod.badge && (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-800 px-2 py-0.5 rounded shadow-2xs">
                        {prod.badge}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{prod.brand}</span>
                      <div className="flex items-center text-amber-500 font-semibold gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="tabular-nums">{prod.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{prod.dosageOrSize}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        ${prod.price.toFixed(2)}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          ${prod.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">In Stock</span>
                  </div>

                  <button
                    onClick={(e) => handleAdd(prod, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAdded ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
