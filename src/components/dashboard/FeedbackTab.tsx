import React, { useState } from 'react';
import { Star, ThumbsUp, Building } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const FeedbackTab: React.FC = () => {
  const { feedbacks } = useDashboard();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filterRating !== 'all' && f.overallRating !== filterRating) return false;
    return true;
  });

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.overallRating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  const avgQuality =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.qualityRating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  const avgSpeed =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.speedRating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Student & Faculty Meal Reviews</span>
          <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            {feedbacks.length} Reviews
          </span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Real-time post-delivery ratings and customer feedback from campus pickup zones (Phase 9)
        </p>
      </div>

      {/* Ratings Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold block">Overall Canteen Rating</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900">{avgRating}</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold block">Food Taste & Quality</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700">{avgQuality} / 5.0</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Pure Veg & Jain</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold block">Floor Delivery Speed</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-blue-700">{avgSpeed} / 5.0</span>
            </div>
            <span className="text-[10px] text-blue-600 font-bold">Ground to 9th Floor</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterRating('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRating === 'all'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Reviews ({feedbacks.length})
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterRating === r
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{r}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </button>
        ))}
      </div>

      {/* Feedbacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedbacks.map((fb) => (
          <div
            key={fb.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  {fb.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{fb.customerName}</h4>
                  <p className="text-[10px] text-gray-400">
                    {fb.customerRole || 'Student'} • {fb.customerUsn || '1RV21CS042'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                <span className="font-black text-xs text-amber-900">{fb.overallRating}.0</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed italic">
              "{fb.comment}"
            </p>

            {/* Tags */}
            {fb.tags && fb.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fb.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md"
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span>Order: #{fb.orderId}</span>
              <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
