
-- Add a table for company pricing quotes on orders
CREATE TABLE public.order_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  quoted_price INTEGER NOT NULL, -- Price in paise
  estimated_duration INTEGER, -- Duration in minutes
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id, company_id)
);

-- Enable RLS for order quotes
ALTER TABLE public.order_quotes ENABLE ROW LEVEL SECURITY;

-- Companies can view and manage their own quotes
CREATE POLICY "Companies can view their own quotes" 
  ON public.order_quotes 
  FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Companies can create their own quotes" 
  ON public.order_quotes 
  FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Companies can update their own quotes" 
  ON public.order_quotes 
  FOR UPDATE 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Customers can view quotes for their orders
CREATE POLICY "Customers can view quotes for their orders" 
  ON public.order_quotes 
  FOR SELECT 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Customers can update quote status (accept/reject)
CREATE POLICY "Customers can update quote status for their orders" 
  ON public.order_quotes 
  FOR UPDATE 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Update the notifications table to include quote_id
ALTER TABLE public.notifications ADD COLUMN quote_id UUID REFERENCES order_quotes(id);

-- Add trigger to update order total_amount when quote is accepted
CREATE OR REPLACE FUNCTION public.update_order_amount_on_quote_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If quote status is changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Update order total_amount and status
    UPDATE orders 
    SET total_amount = NEW.quoted_price,
        status = 'confirmed'
    WHERE id = NEW.order_id;
    
    -- Reject all other quotes for this order
    UPDATE order_quotes 
    SET status = 'rejected',
        updated_at = now()
    WHERE order_id = NEW.order_id 
    AND id != NEW.id
    AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_order_amount_on_quote_acceptance
  AFTER UPDATE ON order_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_order_amount_on_quote_acceptance();

-- Update the notify_nearby_companies function to create notifications for quotes
CREATE OR REPLACE FUNCTION public.notify_nearby_companies()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    company_record RECORD;
    distance_km DECIMAL;
BEGIN
    -- Find all approved companies within 20km radius
    FOR company_record IN 
        SELECT c.id, c.company_name, c.latitude, c.longitude
        FROM companies c
        WHERE c.status = 'approved' 
        AND c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND NEW.latitude IS NOT NULL 
        AND NEW.longitude IS NOT NULL
    LOOP
        -- Calculate distance
        distance_km := calculate_distance(
            NEW.latitude, NEW.longitude,
            company_record.latitude, company_record.longitude
        );
        
        -- If within 20km, create notification
        IF distance_km <= 20 THEN
            INSERT INTO notifications (company_id, order_id, title, message)
            VALUES (
                company_record.id,
                NEW.id,
                'New Booking Request - Quote Needed',
                format('New %s booking at %s, %s - Distance: %.1f km. Please provide your quote.', 
                    NEW.service_type, NEW.address, NEW.city, distance_km)
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- Create trigger to notify companies when new orders are created
DROP TRIGGER IF EXISTS trigger_notify_nearby_companies ON orders;
CREATE TRIGGER trigger_notify_nearby_companies
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_nearby_companies();
