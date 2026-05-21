import { supabase } from '../supabaseClient';

export async function fetchPublicPet(petId) {
  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('pet_id', petId)
    .maybeSingle();

  if (error) throw error;
  if (!pet) return null;

  let owner = null;
  if (pet.owner_id) {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, user_name, email, phone_number, user_type')
      .eq('user_id', pet.owner_id)
      .maybeSingle();
    owner = data;
  }

  return { pet, owner };
}

export function resolvePetImageUrl(url) {
  if (!url?.trim()) return null;
  let s = url.trim();
  if (s.startsWith('//')) s = `https:${s}`;
  try {
    return new URL(s).href;
  } catch {
    return s.replace(/ /g, '%20');
  }
}
