
export type RazorpayConfig = {
  key: string;
  amount: number; // in paise
  name: string;
  description: string;
  order_id?: string; // from server, optional for test
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Dynamically loads the Razorpay script if not already loaded.
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay with given configuration.
 * Call this function on button click.
 */
export async function openRazorpay(config: RazorpayConfig) {
  await loadRazorpayScript();

  const options: any = {
    key: config.key,
    amount: config.amount,
    currency: "INR",
    name: config.name,
    description: config.description,
    prefill: config.prefill,
    handler: function (response: any) {
      config.onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: () => {
        if (config.onFailure) config.onFailure("Payment Cancelled by user");
      },
    },
  };

  if (config.order_id) {
    options.order_id = config.order_id;
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}
