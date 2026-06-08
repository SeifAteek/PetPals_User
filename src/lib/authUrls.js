/** Build absolute URLs for Supabase auth redirects (local, GitHub Pages, Vercel). */

function trimSlash(url) {
  return (url || '').replace(/\/$/, '');
}

export function getSiteOrigin() {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return trimSlash(envUrl);

  const { origin, hostname } = window.location;
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return trimSlash(origin);
  }
  if (hostname.includes('github.io')) {
    return 'https://seifateek.github.io/PetPals_User';
  }
  return trimSlash(origin);
}

export function getAuthPath(path) {
  const base = trimSlash(import.meta.env.BASE_URL || '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || normalized;
}

export function getResetPasswordUrl() {
  return `${getSiteOrigin()}${getAuthPath('/reset-password')}`;
}

export function getForgotPasswordUrl() {
  return `${getSiteOrigin()}${getAuthPath('/forgot-password')}`;
}

export function getAppLoginUrl() {
  return `${getSiteOrigin()}${getAuthPath('/app')}`;
}
