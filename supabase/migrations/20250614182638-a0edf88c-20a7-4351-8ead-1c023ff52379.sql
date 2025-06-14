
-- Remove the price column from services table since companies will set their own prices
ALTER TABLE public.services DROP COLUMN IF EXISTS price;

-- Create a storage bucket for mechanic documents (Aadhaar/PAN cards)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mechanic_documents', 'mechanic_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for mechanic documents
CREATE POLICY "Mechanics can upload their documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'mechanic_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Mechanics can view their own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'mechanic_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all mechanic documents" ON storage.objects
FOR SELECT USING (bucket_id = 'mechanic_documents');
