-- Create a table for verification codes
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security (RLS) for the table
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to insert their own verification codes
CREATE POLICY "Allow individual inserts" ON public.verification_codes FOR INSERT WITH CHECK (auth.email() = email);

-- Create a policy to allow users to select their own verification codes
CREATE POLICY "Allow individual selects" ON public.verification_codes FOR SELECT USING (auth.email() = email);

-- Create a policy to allow users to update their own verification codes (e.g., mark as used)
CREATE POLICY "Allow individual updates" ON public.verification_codes FOR UPDATE USING (auth.email() = email);

-- Create a policy to allow users to delete their own verification codes
CREATE POLICY "Allow individual deletes" ON public.verification_codes FOR DELETE USING (auth.email() = email);

