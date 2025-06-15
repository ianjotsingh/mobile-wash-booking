
-- Add payment_status to orders (default 'unpaid' for new/existing)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

-- Also update order triggers/functions if needed in the future, but just this is enough for now.
