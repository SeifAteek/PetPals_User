import { supabase } from '../supabaseClient';

const COUNT_QUERIES = [
  { key: 'users', table: 'profiles', label: 'Pet parents & adopters' },
  { key: 'pets', table: 'pets', label: 'Pets registered' },
  { key: 'shops', table: 'shops', label: 'Pet shops' },
  { key: 'clinics', table: 'clinics', label: 'Vet clinics' },
  { key: 'shelters', table: 'shelter_profiles', label: 'Shelters' },
];

export async function fetchPlatformStats() {
  const stats = {};

  await Promise.all(
    COUNT_QUERIES.map(async ({ key, table }) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      stats[key] = error ? null : (count ?? 0);
    })
  );

  return stats;
}

export { COUNT_QUERIES };
