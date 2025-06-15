
export interface OrderData {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  city: string;
  car_type: string;
  car_model: string;
  car_color: string;
  special_instructions: string;
  status: string;
  total_amount: number;
  user_id: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  selected_company_id?: string;
}

export interface QuoteData {
  id: string;
  order_id: string;
  quoted_price: number;
  estimated_duration: number;
  additional_notes: string;
  status: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id?: string;
}

export interface CompanyData {
  id: string;
  company_name: string;
}
