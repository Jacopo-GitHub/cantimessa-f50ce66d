
CREATE TYPE public.mass_part AS ENUM (
  'inizio','kyrie','gloria','alleluja','offertorio','santo','agnello','comunione','fine'
);

CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  original_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO anon, authenticated;
GRANT ALL ON public.songs TO service_role;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "public insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update songs" ON public.songs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete songs" ON public.songs FOR DELETE USING (true);

CREATE TABLE public.mass_assignments (
  part public.mass_part PRIMARY KEY,
  song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mass_assignments TO anon, authenticated;
GRANT ALL ON public.mass_assignments TO service_role;
ALTER TABLE public.mass_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read assignments" ON public.mass_assignments FOR SELECT USING (true);
CREATE POLICY "public insert assignments" ON public.mass_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "public update assignments" ON public.mass_assignments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete assignments" ON public.mass_assignments FOR DELETE USING (true);
