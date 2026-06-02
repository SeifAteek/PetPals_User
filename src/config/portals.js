/** Live demos (GitHub Pages) + source repos for PetPals partner portals */
export const PARTNER_PORTALS = [
  {
    id: 'clinic',
    title: 'Clinic Portal',
    description: 'Appointments, health records, billing, and client chat for veterinary clinics.',
    pagesUrl: 'https://seifateek.github.io/PetPalsClinic/',
    repoUrl: 'https://github.com/SeifAteek/PetPalsClinic',
  },
  {
    id: 'shelter',
    title: 'Shelter Portal',
    description: 'Pet inventory, adoption applications, fundraising campaigns, and shelter settings.',
    pagesUrl: 'https://seifateek.github.io/PetPalsShelter/',
    repoUrl: 'https://github.com/SeifAteek/PetPalsShelter',
  },
  {
    id: 'store',
    title: 'Pet Shop Portal',
    description: 'Products, point-of-sale, online orders, restocking, and shop analytics.',
    pagesUrl: 'https://seifateek.github.io/PetPals_ShopApp/',
    repoUrl: 'https://github.com/SeifAteek/PetPals_ShopApp',
  },
  {
    id: 'ios',
    title: 'PetPals iOS App',
    description: 'Mobile app for adopters — NFC tag setup, discovery, care, and community.',
    pagesUrl: 'https://github.com/SeifAteek/PetPals_iOSApp',
    repoUrl: 'https://github.com/SeifAteek/PetPals_iOSApp',
    external: true,
  },
];

export const SITE_REPO = 'https://github.com/SeifAteek/PetPals_User';

/** NFC tag URL written from the iOS app (update if your Pages URL changes) */
export const NFC_PET_URL_EXAMPLE = `${typeof window !== 'undefined' ? window.location.origin : ''}/pet?id=YOUR_PET_ID`;
