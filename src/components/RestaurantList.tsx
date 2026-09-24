import React from 'react';
import type { Restaurant } from '../types';
import { Star, Clock, MapPin, Sparkles, Tag } from 'lucide-react';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  onSelectRestaurant: (id: string | null) => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
}) => {
  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Top Rated Pure Veg Kitchens</span>
            <span className="veg-badge">
              <span className="veg-badge-dot"></span>
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Strictly vegetarian establishments with separate pure veg kitchens
          </p>
        </div>

        {selectedRestaurantId && (
          <button
            onClick={() => onSelectRestaurant(null)}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors border border-emerald-200"
          >
            Show All Kitchens
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((rest) => {
          const isSelected = selectedRestaurantId === rest.id;
          return (
            <div
              key={rest.id}
              onClick={() => onSelectRestaurant(isSelected ? null : rest.id)}
              className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500 shadow-xl'
                  : 'border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl'
              }`}
            >
              <div>
                {/* Restaurant Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Pure Veg Green Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <span className="veg-badge">
                      <span className="veg-badge-dot"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                      Pure Veg
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-emerald-700 text-white px-2 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>{rest.rating}</span>
                  </div>

                  {/* Offer Banner */}
                  {rest.offers?.[0] && (
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>{rest.offers[0]}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                      {rest.name}
                    </h3>
                  </div>

                  {/* Cuisine */}
                  <p className="text-xs text-gray-500 truncate mb-3">
                    {rest.cuisine.join(' • ')}
                  </p>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rest.deliveryTimeMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{rest.distanceKm} km</span>
                    </div>
                    <div className="text-gray-900 font-bold">
                      ₹{rest.costForTwo} for two
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Jain Tag */}
              {rest.pureJainAvailable && (
                <div className="bg-amber-50/70 px-4 py-2 border-t border-amber-100/50 flex items-center justify-between text-[11px] text-amber-900">
                  <span className="flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Jain Friendly Menu Available
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    {isSelected ? 'Viewing Menu' : 'View Menu'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
