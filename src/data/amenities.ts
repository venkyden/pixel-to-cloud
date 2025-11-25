// Amenity labels for property features
// NOTE: Use translation keys from locales/en.json and locales/fr.json
// via the useLanguage hook's t() function: t("amenities.balcony")
export const amenityKeys = [
    "balcony",
    "elevator",
    "near_metro",
    "garden_access",
    "parking",
    "pet_friendly",
    "furnished",
    "near_shops"
] as const;

export type AmenityKey = typeof amenityKeys[number];
