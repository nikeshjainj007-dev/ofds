import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { Leaf, Utensils, Flame, Sparkles, Soup, Zap, Heart, Coffee } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'Leaf':
        return <Leaf className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Soup':
        return <Soup className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      default:
        return <span className="text-sm leading-none">{icon}</span>;
    }
  };

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Explore Veg Categories</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            100% Satvik
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.03]'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200/80 shadow-sm'
              }`}
            >
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                {renderIcon(cat.icon)}
              </div>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
