import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';
import { CAMPUS_PICKUP_ZONES, type Complaint } from '../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedOrderId?: string;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  preselectedOrderId,
}) => {
  const { user } = useAuth();
  const { pastOrders } = useCart();
  const { addComplaint } = useDashboard();
  const { showToast } = useToast();

  const [orderId, setOrderId] = useState<string>(
    preselectedOrderId || (pastOrders[0]?.id ?? 'ORD-782101')
  );
  const [category, setCategory] = useState<Complaint['category']>('Cold Food');
  const [description, setDescription] = useState('');
  const [pickupZone, setPickupZone] = useState(
    user?.pickupZone || CAMPUS_PICKUP_ZONES[8]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide details about your food complaint', 'error');
      return;
    }

    setIsSubmitting(true);

    const complaint = addComplaint({
      orderId,
      customerName: user?.name || 'Campus Student',
      customerUsn: user?.usn || '1RV21CS042',
      customerPhone: user?.phone || '+91 98450 00000',
      pickupZone,
      category,
      description: description.trim(),
    });

    setIsSubmitting(false);
    showToast(
      `Complaint #${complaint.id} logged. Canteen manager will review and resolve it promptly.`,
      'success',
      'Complaint Submitted'
    );
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-rose-500/30 text-rose-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-rose-400/20">
              Customer Support & Quality Desk
            </span>
          </div>
          <h3 className="text-xl font-black">File a Food / Delivery Complaint</h3>
          <p className="text-xs text-rose-100 mt-1">
            We take campus food quality and hygiene seriously. Let us know what went wrong.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Select Order */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Select Related Order *
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
            >
              {pastOrders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.id} • ₹{ord.grandTotal} ({ord.pickupZone})
                </option>
              ))}
            </select>
          </div>

          {/* Issue Category */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Complaint Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Cold Food',
                'Food Quality & Taste',
                'Delayed Delivery',
                'Missing Item',
                'Packaging Issue',
                'Hygiene Concern',
              ].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat as Complaint['category'])}
                  className={`p-2 rounded-xl border text-left font-bold transition-all ${
                    category === cat
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Zone */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Delivery Pickup Floor / Wing *
            </label>
            <select
              value={pickupZone}
              onChange={(e) => setPickupZone(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
            >
              {CAMPUS_PICKUP_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Describe Your Complaint in Detail *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Sambar arrived lukewarm on the 6th floor Wing B, and the delivery runner was 15 minutes late..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:bg-white focus:border-rose-600 focus:outline-none leading-relaxed"
            ></textarea>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Your complaint will be forwarded straight to the Head Chef and Canteen Manager Dashboard. Refund or replacement will be arranged.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
