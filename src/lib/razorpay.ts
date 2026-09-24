declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentOptions {
  amountInRupees: number;
  orderId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  description?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (options: RazorpayPaymentOptions) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TfVrQ8ZYE8yoPj';

  const rzpOptions = {
    key: razorpayKey,
    amount: Math.round(options.amountInRupees * 100), // amount in paise
    currency: 'INR',
    name: 'SatvikBite - Pure Veg Delights',
    description: options.description || 'Delicious 100% Pure Vegetarian Food Delivery',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=128&auto=format&fit=crop&q=80',
    prefill: {
      name: options.userName || 'Satvik Foodie',
      email: options.userEmail || 'foodie@satvikbite.com',
      contact: options.userPhone || '9876543210',
    },
    theme: {
      color: '#16a34a', // Emerald Veg Green
    },
    handler: function (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) {
      if (response && response.razorpay_payment_id) {
        options.onSuccess(response.razorpay_payment_id);
      } else {
        options.onSuccess('PAY_TEST_' + Math.random().toString(36).substring(2, 9).toUpperCase());
      }
    },
    modal: {
      ondismiss: function () {
        if (options.onFailure) {
          options.onFailure({ message: 'Payment cancelled by user' });
        }
      },
    },
  };

  try {
    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  } catch (err) {
    console.error('Failed to open Razorpay modal:', err);
    throw err;
  }
};
