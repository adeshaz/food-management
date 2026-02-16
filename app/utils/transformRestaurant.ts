// // utils/transformRestaurant.ts
// export function transformRestaurant(restaurant: any) {
//     return {
//         id: restaurant._id.toString(),
//         name: restaurant.name,
//         description: restaurant.description,
//         cuisine: restaurant.cuisineType,
//         deliveryFee: restaurant.deliveryTime || 500,
//         minOrder: restaurant.minimumOrder || 1000,
//         address: restaurant.address?.street || '',
//         city: restaurant.address?.city || '',
//         phone: restaurant.contact?.phone || '',
//         openingHours: restaurant.openingHours?.general || '',
//         rating: restaurant.rating || 4.0,
//         image: restaurant.images?.[0] || '',
//         isOpen: true,
//         featured: restaurant.featured || false
//     };
// }