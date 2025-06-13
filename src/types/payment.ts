
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash';
  name: string;
  details?: string;
  isDefault?: boolean;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface PaymentBreakdown {
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
}

export interface PaymentSplit {
  walletAmount: number;
  cardAmount: number;
  method: PaymentMethod;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}
