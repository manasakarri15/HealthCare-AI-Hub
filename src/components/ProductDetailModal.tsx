import React, { useState } from 'react';
import { X, Star, ShieldCheck, Check, Plus, Minus, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg z-10 bg-white/80"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Image Box */}
            <div className="aspect-4/3 sm:aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-900 px-2.5 py-1 rounded shadow-2xs">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Info header */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  {product.brand}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mt-1">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{product.dosageOrSize}</p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-slate-900 ml-1 tabular-nums">{product.rating}</span>
                </div>
                <span aria-hidden="true">·</span>
                <span>{product.reviewCount} Verified Clinical Reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-semibold ml-2">In Stock</span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={added}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Medical Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart · ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Free delivery info */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Truck className="w-3.5 h-3.5 text-teal-700" />
                <span>Free express courier shipping on orders over $50</span>
              </div>
            </div>
          </div>

          {/* Description & Clinical Highlights */}
          <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Clinical Overview
              </h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Key Clinical Highlights
              </h3>
              <ul className="space-y-1.5 text-slate-700">
                {product.clinicalHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Usage & Directions
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {product.usageInstructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
