// lib/api/restaurants.ts
export async function getRestaurantById(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/restaurants/${id}`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
}