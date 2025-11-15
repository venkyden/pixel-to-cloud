-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'landlord', 'tenant');
CREATE TYPE public.incident_category AS ENUM ('maintenance', 'payment', 'dispute', 'legal', 'safety', 'communication', 'other');
CREATE TYPE public.incident_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
CREATE TYPE public.incident_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.legal_status AS ENUM ('compliant', 'pending', 'non_compliant');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (security critical - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT '€',
  rooms INTEGER NOT NULL,
  location TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  neighborhood_rating DECIMAL DEFAULT 0,
  transport_score DECIMAL DEFAULT 0,
  legal_status legal_status DEFAULT 'pending',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create tenant applications table
CREATE TABLE public.tenant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  profession TEXT,
  income DECIMAL,
  co_signer_income DECIMAL,
  rental_history TEXT,
  move_in_date DATE,
  status TEXT DEFAULT 'pending',
  match_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'medium',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tenant_applications ENABLE ROW LEVEL SECURITY;

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category incident_category NOT NULL,
  status incident_status DEFAULT 'open',
  priority incident_priority DEFAULT 'medium',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create incident timeline table
CREATE TABLE public.incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT '€',
  description TEXT,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for properties
CREATE POLICY "Anyone can view properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Landlords can create properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can update own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can delete own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tenant_applications
CREATE POLICY "Users can view own applications"
  ON public.tenant_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Tenants can create applications"
  ON public.tenant_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND (public.has_role(auth.uid(), 'tenant') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users can update own applications"
  ON public.tenant_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for incidents
CREATE POLICY "Users can view related incidents"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reported_by
    OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR auth.uid() IN (SELECT user_id FROM tenant_applications WHERE property_id = incidents.property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Related users can update incidents"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = reported_by
    OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for incident_timeline
CREATE POLICY "Users can view related timeline"
  ON public.incident_timeline FOR SELECT
  TO authenticated
  USING (
    incident_id IN (
      SELECT id FROM incidents WHERE
      auth.uid() = reported_by
      OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Users can create timeline entries"
  ON public.incident_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    incident_id IN (
      SELECT id FROM incidents WHERE
      auth.uid() = reported_by
      OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- RLS Policies for documents
CREATE POLICY "Users can view related documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create own documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view related payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = tenant_id
    OR auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Landlords can create payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Landlords can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenant_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();