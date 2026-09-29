import React from 'react';
import { X, ShieldCheck, FileText, Cookie } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-black">Campus Canteen Privacy Policy</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-600 leading-relaxed">
          <p>
            <strong>Effective Date: Academic Year 2025–2026</strong>
          </p>

          <h4 className="text-sm font-bold text-gray-900">1. Information We Collect</h4>
          <p>
            The Campus Online Food Delivery System ("OFDS") collects your Student USN or Faculty ID, Full Name, College Email, Phone Number, Date of Birth (DOB), and Floor Pickup Zone solely to fulfill hot meal deliveries to campus blocks.
          </p>

          <h4 className="text-sm font-bold text-gray-900">2. Payment Security</h4>
          <p>
            All online transactions are processed through <strong>Razorpay</strong>. No card numbers, CVVs, or netbanking passwords are saved on college servers. All payments adhere to PCI-DSS standards.
          </p>

          <h4 className="text-sm font-bold text-gray-900">3. Delivery & Campus Logistics</h4>
          <p>
            Delivery runners only view your Name, Pickup Floor/Wing (Ground to 9th Floor, Wings A/B), and Contact Number during active dispatch. Information is purged after the shift.
          </p>

          <h4 className="text-sm font-bold text-gray-900">4. Data Protection</h4>
          <p>
            Your information is never sold to third-party commercial advertisers. Data is stored safely within Supabase and Clerk enterprise authentication infrastructure.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-black">Campus Canteen Terms & Conditions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-600 leading-relaxed">
          <h4 className="text-sm font-bold text-gray-900">1. Meal Slots & 20-Minute Order Cutoff Policy</h4>
          <p>
            To allow our kitchen chefs to cook and pack meals safely:
            <br />• <strong>Breakfast:</strong> Delivered 9:30 AM to 10:00 AM. <em>Orders strictly close at 9:40 AM (20 minutes before slot end).</em>
            <br />• <strong>Lunch:</strong> Delivered 1:20 PM to 2:30 PM. <em>Orders strictly close at 2:10 PM (20 minutes before slot end).</em>
            <br />Orders placed after cutoff cannot be accepted.
          </p>

          <h4 className="text-sm font-bold text-gray-900">2. ₹0 Delivery Charges & Pickup Zones</h4>
          <p>
            Deliveries are made 100% free of charge to designated pickup points on Ground Floor to 9th Floor in Wings A & B. Students and faculty must meet the floor runner at the pickup station.
          </p>

          <h4 className="text-sm font-bold text-gray-900">3. Cashless Policy (NO Cash On Delivery)</h4>
          <p>
            As mandated by college hygiene guidelines, <strong>Cash On Delivery (COD) is strictly prohibited</strong>. All orders must be prepaid online via Razorpay.
          </p>

          <h4 className="text-sm font-bold text-gray-900">4. 100% Pure Vegetarian & Jain Food</h4>
          <p>
            The campus kitchen only prepares certified Pure Vegetarian food. Jain food is guaranteed free of onions, garlic, and root vegetables.
          </p>

          <h4 className="text-sm font-bold text-gray-900">5. Refunds & Quality Complaints</h4>
          <p>
            If any item delivered is cold, defective, or incorrect, students can file a complaint via the Complaint Option within 30 minutes of delivery for an instant canteen credit or Razorpay refund.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export const CookieBanner: React.FC = () => {
  const [isAccepted, setIsAccepted] = React.useState(() => {
    return localStorage.getItem('satvik_cookies_accepted') === 'true';
  });

  if (isAccepted) return null;

  const handleAccept = () => {
    localStorage.setItem('satvik_cookies_accepted', 'true');
    setIsAccepted(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white border border-emerald-200 p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom">
      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Cookie className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-black text-gray-900">Campus Cookies & Local State</h4>
        <p className="text-[11px] text-gray-500 leading-normal">
          We use local cookies to save your student USN, pickup zone preference, and active meal cart.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg transition-colors"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
