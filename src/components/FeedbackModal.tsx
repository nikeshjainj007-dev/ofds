import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';
import type { Order } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { user } = useAuth();
  const { addFeedback } = useDashboard();
  const { showToast } = useToast();

  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Hot & Fresh',
    'Delivered on Time',
  ]);

  if (!isOpen || !order) return null;

  const availableTags = [
    'Hot & Fresh',
    'Delivered on Time',
    'Piping Hot',
    'Courteous Runner',
    'Great Taste',
    'Clean Packaging',
    'Subsidized Value',
    'Pure Jain Verified',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addFeedback({
      orderId: order.id,
      customerName: user?.name || order.customerName || 'Campus Scholar',
      customerUsn: user?.usn || order.customerUsn || '1RV21CS042',
      customerRole: user?.role || order.customerRole || 'Student',
      overallRating,
      qualityRating,
      speedRating,
      comment: comment.trim() || 'Food was delivered fresh and hot to the pickup zone!',
      tags: selectedTags,
    });

    showToast(
      'Thank you! Your feedback has been shared with the Canteen team.',
      'success',
      'Feedback Received'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Delivered Meal Rating • Phase 9
            </span>
          </div>
          <h3 className="text-xl font-black">How was your Campus Food?</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Order #{order.id} delivered to {order.pickupZone}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Overall Rating */}
          <div className="text-center space-y-2">
            <label className="block font-black text-sm text-gray-900">
              Overall Canteen Experience
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setOverallRating(star)}
                  className="p-1.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= overallRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-600 font-bold">
              {overallRating === 5
                ? '⭐ Excellent! Campus Favorite'
                : overallRating === 4
                ? 'Very Good'
                : overallRating === 3
                ? 'Average'
                : 'Needs Improvement'}
            </p>
          </div>

          {/* Sub-ratings */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <span className="font-bold text-gray-700 block mb-1.5">Food Taste & Quality</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setQualityRating(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= qualityRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-700 block mb-1.5">Floor Delivery Speed</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSpeedRating(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= speedRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Compliments */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              What did you like the most?
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Add a Comment (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Arrived piping hot on 4th floor Wing A! Delicious podi dosa."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
