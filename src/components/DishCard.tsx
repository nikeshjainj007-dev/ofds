import React, { useState } from 'react';
import type { Dish } from '../types';
import { useCart } from '../context/CartContext';
import { Star, Clock, Flame, Plus, Minus, Sparkles, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { items, addItem, updateQuantity } = useCart();
  const { showToast } = useToast();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [isJainOption, setIsJainOption] = useState(dish.isJainFriendly || false);
  const [specialNote, setSpecialNote] = useState('');

  const cartItem = items.find((i) => i.dish.id === dish.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddClick = () => {
    // If it has customizable options (like Jain or spice level), we can open the modal or add directly
    if (dish.isJainFriendly) {
      setIsCustomizeOpen(true);
    } else {
      addItem(dish);
      showToast(`Added "${dish.name}" to cart`, 'success');
    }
  };

  const handleConfirmCustomization = () => {
    addItem(dish, {
      isJain: isJainOption,
      spiceLevel,
      specialNote: specialNote.trim() || undefined,
    });
    setIsCustomizeOpen(false);
    showToast(`Added custom "${dish.name}" to cart`, 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Dish Image Container */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Pure Veg Badge Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-md flex items-center gap-1.5">
            <span className="veg-badge">
              <span className="veg-badge-dot"></span>
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              100% Veg
            </span>
          </div>

          {/* Tags */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {dish.isBestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                ★ Bestseller
              </span>
            )}
            {dish.isJainFriendly && (
              <span className="bg-emerald-700 text-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                Jain Option
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{dish.prepTimeMinutes} mins</span>
          </div>
        </div>

        {/* Rating and Restaurant Name */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-[180px]">
            {dish.restaurantName}
          </span>
          <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-emerald-900 text-xs font-bold">
            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            <span>{dish.rating}</span>
            <span className="text-[10px] text-gray-500 font-normal">({dish.votesCount})</span>
          </div>
        </div>

        {/* Dish Title */}
        <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors mb-1">
          {dish.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {dish.description}
        </p>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">₹{dish.price}</span>
            {dish.originalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{dish.originalPrice}</span>
            )}
          </div>
          {dish.calories && (
            <div className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-amber-500" />
              <span>{dish.calories} kcal</span>
            </div>
          )}
        </div>

        {/* Add Button or Stepper */}
        {quantity === 0 ? (
          <button
            type="button"
            onClick={handleAddClick}
            className="px-5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-2 border-emerald-600 font-black text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Add</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-md overflow-hidden font-bold text-xs">
            <button
              onClick={() => updateQuantity(dish.id, quantity - 1)}
              className="p-2 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-black text-sm">{quantity}</span>
            <button
              onClick={() => updateQuantity(dish.id, quantity + 1)}
              className="p-2 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">{dish.name}</h4>
                <p className="text-xs text-gray-500">Customize your pure veg meal</p>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Jain Option Switch */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-4">
              <label className="flex items-start justify-between cursor-pointer gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Make it 100% Jain Preparation</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-1">
                    Strictly prepared without onion, garlic, or root vegetables.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isJainOption}
                  onChange={(e) => setIsJainOption(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer accent-emerald-600"
                />
              </label>
            </div>

            {/* Spice Level */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Spice Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium', 'Spicy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpiceLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      spiceLevel === lvl
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Chef Instructions */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Special Request for Chef (Optional)
              </label>
              <input
                type="text"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="e.g. Less oil, extra green chutney"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <button
              onClick={handleConfirmCustomization}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Add to Cart • ₹{dish.price}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
