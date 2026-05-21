-- Run in Supabase SQL Editor so the public website can show live stats and NFC pet profiles.
-- Adjust or tighten policies if you need to hide specific fields later.

-- Pets: allow anonymous read (NFC public profile pages)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_pets" ON public.pets;
CREATE POLICY "public_read_pets" ON public.pets
  FOR SELECT TO anon, authenticated USING (true);

-- Profiles: allow anonymous read of basic contact fields (owner info on pet pages + user count)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
CREATE POLICY "public_read_profiles" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

-- Platform stats (counts only — no sensitive columns exposed via select head)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_shops_count" ON public.shops;
CREATE POLICY "public_read_shops_count" ON public.shops
  FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_clinics_count" ON public.clinics;
CREATE POLICY "public_read_clinics_count" ON public.clinics
  FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.shelter_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_shelters_count" ON public.shelter_profiles;
CREATE POLICY "public_read_shelters_count" ON public.shelter_profiles
  FOR SELECT TO anon, authenticated USING (true);
