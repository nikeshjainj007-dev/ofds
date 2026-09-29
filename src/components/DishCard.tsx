import React, { useState } from 'react';
import type { Dish } from '../types';
import { useCart } from '../context/CartContext';
import { useDashboard } from '../context/DashboardContext';
import { getCampusScheduleStatus } from '../lib/campusSchedule';
import { Star, Clock, Plus, Minus, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { items, addItem, updateQuantity } = useCart();
  const { canteenSettings } = useDashboard();
  const { showToast } = useToast();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [isJainOption, setIsJainOption] = useState(dish.isJainFriendly || false);

  const schedule = getCampusScheduleStatus(new Date(), canteenSettings.demoBypassTiming);

  // Determine if this specific dish can be ordered right now (Phase 4)
  let isDishAvailableNow = dish.isAvailable !== false;
  let timingRestrictionMessage: string | null = null;

  if (!canteenSettings.demoBypassTiming) {
    if (dish.mealSlot === 'breakfast' && !schedule.canOrderBreakfast) {
      isDishAvailableNow = false;
      timingRestrictionMessage = 'Breakfast closed (Cutoff 9:40 AM)';
    } else if (dish.mealSlot === 'lunch' && !schedule.canOrderLunch) {
      isDishAvailableNow = false;
      timingRestrictionMessage = 'Lunch closed (Cutoff 2:10 PM)';
    }
  }

  const cartItem = items.find((i) => i.dish.id === dish.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddClick = () => {
    if (!isDishAvailableNow) {
      showToast(timingRestrictionMessage || 'This item is currently unavailable.', 'error', 'Ordering Closed');
      return;
    }

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
    });
    setIsCustomizeOpen(false);
    showToast(`Added custom "${dish.name}" to cart`, 'success');
  };

  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col justify-between group ${
      !isDishAvailableNow ? 'border-gray-200 opacity-90' : 'border-gray-100'
    }`}>
      <div>
        {/* Dish Image Container */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* 100% Pure Veg Badge Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-md flex items-center gap-1.5">
            <span className="veg-badge">
              <span className="veg-badge-dot"></span>
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              100% Pure Veg
            </span>
          </div>

          {/* Tags */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {dish.isBestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                ★ Campus Favorite
              </span>
            )}
            {dish.isJainFriendly && (
              <span className="bg-emerald-700 text-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                Pure Jain Option
              </span>
            )}
            {timingRestrictionMessage && (
              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
                {timingRestrictionMessage}
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{dish.prepTimeMinutes} mins prep</span>
          </div>
        </div>

        {/* Counter & Ratings */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-[200px]">
            {dish.restaurantName}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-900 text-xs font-bold border border-amber-100">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{dish.rating}</span>
          </div>
        </div>

        {/* Dish Title */}
        <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors mb-1">
          {dish.name}
        </h3>

        {/* Dish Description */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {dish.description}
        </p>
      </div>

      {/* Price and Add/Custom Button Bar */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div>
          <div className="text-[10px] text-gray-400 font-semibold uppercase">Subsidized Rate</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">₹{dish.price}</span>
            {dish.originalPrice && dish.originalPrice > dish.price && (
              <span className="text-xs text-gray-400 line-through">₹{dish.originalPrice}</span>
            )}
          </div>
        </div>

        <div>
          {!isDishAvailableNow ? (
            <button
              disabled
              className="px-3.5 py-2 bg-gray-100 text-gray-400 rounded-xl font-bold text-xs cursor-not-allowed"
            >
              Order Closed
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAddClick}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider border border-emerald-200 hover:border-emerald-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-600 text-white rounded-xl p-1 font-bold text-xs shadow-md">
              <button
                type="button"
                onClick={() => updateQuantity(dish.id, quantity - 1)}
                className="w-7 h-7 rounded-lg bg-emerald-700/60 hover:bg-emerald-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-black text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(dish.id, quantity + 1)}
                className="w-7 h-7 rounded-lg bg-emerald-700/60 hover:bg-emerald-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 border border-emerald-100">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Campus Canteen Customization
              </span>
              <h4 className="font-extrabold text-base text-gray-900 mt-1">{dish.name}</h4>
              <p className="text-xs text-gray-500">Select dietary preferences for kitchen preparation.</p>
            </div>

            {/* Jain Option Switch */}
            {dish.isJainFriendly && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Pure Jain Preparation
                  </div>
                  <div className="text-[10px] text-amber-800/80">
                    No onion, garlic, or root vegetables
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsJainOption(!isJainOption)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isJainOption ? 'bg-amber-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isJainOption ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            )}

            {/* Spice Level */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Spice Preference:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium', 'Spicy'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      spiceLevel === level
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Add to Platter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
