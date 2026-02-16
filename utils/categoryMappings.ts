// utils/categoryMappings.ts
export const categoryMappings: Record<string, string> = {
    // Homepage display names -> Database categories
    "local-delicacies": "Traditional",
    "swallow-foods": "Swallow",
    "grills-bbq": "Protein",
    "snacks-drinks": "Snacks",
    // Direct matches (if someone types URL directly)
    "traditional": "Traditional",
    "rice-dishes": "Rice Dishes",
    "swallow": "Swallow",
    "protein": "Protein",
    "snacks": "Snacks",
    "breakfast": "Breakfast",
    "soups-stews": "Soups & Stews",
    "drinks": "Drinks",
    "desserts": "Desserts",
    "lunch": "Lunch",
    "dinner": "Dinner",
    "special": "Special"
};

export function getDbCategory(slug: string): string | null {
    // Remove any trailing slash and convert to lowercase
    const cleanSlug = slug.toLowerCase().trim();

    // Check if slug exists in mappings
    if (categoryMappings[cleanSlug]) {
        return categoryMappings[cleanSlug];
    }

    // If not found, try to find a close match
    for (const key in categoryMappings) {
        if (cleanSlug.includes(key) || key.includes(cleanSlug)) {
            return categoryMappings[key];
        }
    }

    return null;
}