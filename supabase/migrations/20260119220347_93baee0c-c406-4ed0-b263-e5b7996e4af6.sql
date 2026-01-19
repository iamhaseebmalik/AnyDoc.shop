-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create editing_history table for document edits
CREATE TABLE public.editing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  edited_fields JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on editing_history
ALTER TABLE public.editing_history ENABLE ROW LEVEL SECURITY;

-- Editing history policies
CREATE POLICY "Users can view their own editing history" 
ON public.editing_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own editing history" 
ON public.editing_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own editing history" 
ON public.editing_history FOR DELETE 
USING (auth.uid() = user_id);

-- Add user_id column to document_uploads (optional, for authenticated uploads)
ALTER TABLE public.document_uploads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update document_uploads RLS to support authenticated users
DROP POLICY IF EXISTS "Users can view own uploads by session" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can insert uploads" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.document_uploads;

CREATE POLICY "Users can view own uploads" 
ON public.document_uploads FOR SELECT 
USING (auth.uid() = user_id OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can insert uploads" 
ON public.document_uploads FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete own uploads" 
ON public.document_uploads FOR DELETE 
USING (auth.uid() = user_id OR true);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();