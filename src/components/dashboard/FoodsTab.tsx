import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image,
  Clock,
  Sparkles,
  Leaf,
  X
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useToast } from '../../context/ToastContext';
import type { Dish } from '../../types';

export const FoodsTab: React.FC = () => {
  const { dishes, addDish, updateDish, deleteDish, toggleDishAvailability } = useDashboard();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 40,
    originalPrice: 55,
    category: 'Breakfast',
    mealSlot: 'breakfast' as 'breakfast' | 'lunch' | 'all_day',
    restaurantName: 'Campus Canteen - South Indian & Breakfast Counter',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    isJainFriendly: true,
    prepTimeMinutes: 10,
    tags: 'Campus Special, Pure Veg',
  });

  // Quick curated photo presets for campus canteen food
  const PHOTO_PRESETS = [
    { label: 'Crispy Dosa', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80' },
    { label: 'Steamed Idli', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
    { label: 'Campus Thali', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Paneer Gravy', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Veg Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Samosa & Chaat', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
    { label: 'Grilled Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
    { label: 'Filter Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    { label: 'Badam Milk', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Juice', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80' },
  ];

  // Inline price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    if (selectedCategory !== 'all' && dish.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dish.name.toLowerCase().includes(q) ||
        dish.description.toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      price: 35,
      originalPrice: 50,
      category: 'Breakfast',
      mealSlot: 'breakfast',
      restaurantName: 'Campus Canteen - South Indian & Breakfast Counter',
      image: PHOTO_PRESETS[0].url,
      isJainFriendly: true,
      prepTimeMinutes: 10,
      tags: 'Campus Special, Pure Veg',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      originalPrice: dish.originalPrice || dish.price + 15,
      category: dish.category,
      mealSlot: dish.mealSlot || 'all_day',
      restaurantName: dish.restaurantName,
      image: dish.image,
      isJainFriendly: !!dish.isJainFriendly,
      prepTimeMinutes: dish.prepTimeMinutes || 10,
      tags: (dish.tags || []).join(', '),
    });
    setIsAddModalOpen(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a dish name', 'error');
      return;
    }

    const tagArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingDish) {
      updateDish(editingDish.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        category: formData.category,
        mealSlot: formData.mealSlot,
        image: formData.image,
        isJainFriendly: formData.isJainFriendly,
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        tags: tagArray,
      });
      showToast(`Updated "${formData.name}" successfully!`, 'success', 'Food Updated');
    } else {
      addDish({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        category: formData.category,
        mealSlot: formData.mealSlot,
        restaurantId: 'canteen-main',
        restaurantName: formData.restaurantName,
        rating: 5.0,
        votesCount: 1,
        image: formData.image,
        isJainFriendly: formData.isJainFriendly,
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        tags: tagArray,
        isAvailable: true,
      });
      showToast(`Added "${formData.name}" to Canteen Menu!`, 'success', 'Food Added');
    }

    setIsAddModalOpen(false);
  };

  const handleStartEditPrice = (dish: Dish) => {
    setEditingPriceId(dish.id);
    setTempPrice(dish.price);
  };

  const handleSaveInlinePrice = (dishId: string) => {
    if (tempPrice <= 0) {
      showToast('Price must be greater than ₹0', 'error');
      return;
    }
    updateDish(dishId, { price: tempPrice });
    setEditingPriceId(null);
    showToast(`Price updated to ₹${tempPrice}!`, 'success', 'Price Saved');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Canteen Food & Menu Control</span>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {dishes.length} Items Live
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new meals, update prices, change photos, and manage Pure Veg & Jain meal availability (Phase 6)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search dish or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
          >
            {/* Dish Photo with quick photo change overlay */}
            <div className="relative h-44 w-full bg-gray-100 group">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(dish)}
                  className="px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 flex items-center gap-1.5"
                >
                  <Image className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Update Photo</span>
                </button>
              </div>

              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white/95 text-emerald-800 text-[10px] font-black shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Pure Veg
                </span>
                {dish.isJainFriendly && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Jain
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase shadow-sm ${
                    dish.isAvailable !== false
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {dish.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
            </div>

            {/* Dish Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {dish.category}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dish.prepTimeMinutes || 10}m prep
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-gray-900 mt-1">{dish.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {dish.description}
                </p>
              </div>

              {/* Price & Controls */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Campus Rate</span>
                  {editingPriceId === dish.id ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-black text-xs text-gray-900">₹</span>
                      <input
                        type="number"
                        min="5"
                        max="500"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value))}
                        className="w-16 p-1 text-xs font-black bg-gray-50 border border-emerald-500 rounded-lg outline-none"
                      />
                      <button
                        onClick={() => handleSaveInlinePrice(dish.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-gray-900">₹{dish.price}</span>
                      {dish.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{dish.originalPrice}</span>
                      )}
                      <button
                        onClick={() => handleStartEditPrice(dish)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-bold"
                      >
                        Edit Price
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock Toggle & Edit Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleDishAvailability(dish.id)}
                    title={dish.isAvailable !== false ? 'Mark as Out of Stock' : 'Mark as Available'}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                      dish.isAvailable !== false
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {dish.isAvailable !== false ? 'Available' : 'Unavailable'}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(dish)}
                    title="Edit Dish Full Details"
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove "${dish.name}" from canteen menu?`)) {
                        deleteDish(dish.id);
                        showToast(`Removed "${dish.name}"`, 'info');
                      }
                    }}
                    title="Delete Dish"
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-300" />
                <h3 className="text-lg font-black">
                  {editingDish ? 'Update Canteen Food Item' : 'Add New Food to Canteen Menu'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Dish Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa with Desi Ghee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Category & Meal Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Breakfast">Breakfast (9:30 - 10:00 AM)</option>
                    <option value="Lunch">Lunch (1:20 - 2:30 PM)</option>
                    <option value="Snacks">Snacks & Chaat</option>
                    <option value="Beverages">Beverages & Coffee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Meal Slot Policy *</label>
                  <select
                    value={formData.mealSlot}
                    onChange={(e) => setFormData({ ...formData, mealSlot: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="breakfast">Breakfast Slot Only</option>
                    <option value="lunch">Lunch Slot Only</option>
                    <option value="all_day">All Day Canteen Special</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Campus Subsidized Price (₹) *</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Hotel Rate (₹)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo URL & Quick Presets (Phase 6 requirement) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Food Photo URL *</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Pick preset or paste custom URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] focus:bg-white focus:border-emerald-600 focus:outline-none"
                />

                {/* Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PHOTO_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setFormData({ ...formData, image: p.url })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        formData.image === p.url
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jain Toggle & Prep Time */}
              <div className="grid grid-cols-2 gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.isJainFriendly}
                    onChange={(e) => setFormData({ ...formData, isJainFriendly: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>100% Jain Friendly (No root veg)</span>
                </label>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, preparation style, and sides included..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  {editingDish ? 'Save Changes' : 'Add to Canteen Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
