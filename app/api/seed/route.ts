// // // app/api/seed/route.ts - FIXED FOR YOUR SCHEMA
// // import { NextRequest, NextResponse } from 'next/server';
// // import connectToDatabase from '@/lib/db';
// // import FoodItem from '@/models/FoodItem';
// // import Restaurant from '@/models/Restaurant';

// // // Fixed sample restaurants to match YOUR schema
// // const sampleRestaurants = [
// //     {
// //         name: 'Taste of Osogbo',
// //         description: 'Authentic Yoruba cuisine with recipes passed down for generations',
// //         cuisineType: 'nigerian', // ✅ lowercase to match enum
// //         address: {
// //             street: '123 Oke-Fia Road',
// //             city: 'Osogbo',
// //             state: 'Osun State'
// //         },
// //         contact: {
// //             phone: '08012345678',
// //             email: 'info@tasteofosogbo.com'
// //         },
// //         // ✅ FIXED: openingHours with open/close objects
// //         openingHours: {
// //             monday: { open: '08:00', close: '22:00' },
// //             tuesday: { open: '08:00', close: '22:00' },
// //             wednesday: { open: '08:00', close: '22:00' },
// //             thursday: { open: '08:00', close: '22:00' },
// //             friday: { open: '08:00', close: '23:00' },
// //             saturday: { open: '09:00', close: '23:00' },
// //             sunday: { open: '10:00', close: '21:00' }
// //         },
// //         images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'],
// //         rating: 4.8,
// //         deliveryTime: 25,
// //         minimumOrder: 1500,
// //         featured: true
// //     },
// //     {
// //         name: 'Amala Sky Restaurant',
// //         description: 'Specializing in traditional swallow foods with modern presentation',
// //         cuisineType: 'nigerian', // ✅ lowercase
// //         address: {
// //             street: '45 Ilesa Road',
// //             city: 'Osogbo',
// //             state: 'Osun State'
// //         },
// //         contact: {
// //             phone: '08087654321',
// //             email: 'hello@amalasky.com'
// //         },
// //         openingHours: {
// //             monday: { open: '09:00', close: '22:00' },
// //             tuesday: { open: '09:00', close: '22:00' },
// //             wednesday: { open: '09:00', close: '22:00' },
// //             thursday: { open: '09:00', close: '22:00' },
// //             friday: { open: '09:00', close: '23:00' },
// //             saturday: { open: '10:00', close: '23:00' },
// //             sunday: { open: '11:00', close: '21:00' }
// //         },
// //         images: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop'],
// //         rating: 4.6,
// //         deliveryTime: 30,
// //         minimumOrder: 1200,
// //         featured: true
// //     },
// //     {
// //         name: 'Iya Basira Kitchen',
// //         description: 'Home-cooked meals with love and care, just like mama makes',
// //         cuisineType: 'nigerian', // ✅ lowercase
// //         address: {
// //             street: '78 Oke-Baale Street',
// //             city: 'Osogbo',
// //             state: 'Osun State'
// //         },
// //         contact: {
// //             phone: '08033445566',
// //             email: 'iyabasira@kitchen.com'
// //         },
// //         openingHours: {
// //             monday: { open: '07:00', close: '21:00' },
// //             tuesday: { open: '07:00', close: '21:00' },
// //             wednesday: { open: '07:00', close: '21:00' },
// //             thursday: { open: '07:00', close: '21:00' },
// //             friday: { open: '07:00', close: '22:00' },
// //             saturday: { open: '08:00', close: '22:00' },
// //             sunday: { open: '08:00', close: '20:00' }
// //         },
// //         images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop'],
// //         rating: 4.9,
// //         deliveryTime: 35,
// //         minimumOrder: 1000,
// //         featured: false
// //     }
// // ];

// // // Sample foods remain the same but need restaurantName lowercase
// // const sampleFoods = [
// //     {
// //         name: 'Jollof Rice with Grilled Chicken',
// //         description: 'Classic Nigerian party rice with perfectly grilled chicken, served with fried plantains',
// //         price: 3500,
// //         category: 'Rice Dishes',
// //         restaurantName: 'Taste of Osogbo', // ✅ This should match restaurant name
// //         images: ['images/foods/jollof-rice.jpg'], // ✅ Local image path
// //         ingredients: ['Rice', 'Tomatoes', 'Bell peppers', 'Chicken', 'Spices', 'Onions', 'Vegetable oil'],
// //         preparationTime: 30,
// //         spicyLevel: 2,
// //         isVegetarian: false,
// //         isPopular: true,
// //         rating: 4.8,
// //         ratingCount: 156,
// //         tags: ['jollof', 'rice', 'chicken', 'party', 'popular', 'nigerian']
// //     },
// //     {
// //         name: 'Pounded Yam with Egusi Soup',
// //         description: 'Smooth pounded yam served with rich melon seed soup and assorted meats',
// //         price: 4000,
// //         originalPrice: 4500,
// //         discount: 11,
// //         category: 'Swallow',
// //         restaurantName: 'Taste of Osogbo',
// //         images: ['/images/foods/pounded-yam.jpg'],
// //         ingredients: ['Yam', 'Melon seeds', 'Assorted meats', 'Spinach', 'Palm oil', 'Crayfish', 'Pepper'],
// //         preparationTime: 45,
// //         spicyLevel: 1,
// //         isVegetarian: false,
// //         isPopular: true,
// //         rating: 4.9,
// //         ratingCount: 89,
// //         tags: ['pounded-yam', 'egusi', 'swallow', 'traditional', 'soup']
// //     },
// //     {
// //         name: 'Amala with Ewedu & Gbegiri',
// //         description: 'Traditional Yoruba dish made from yam flour served with jute leaves soup and bean soup',
// //         price: 2800,
// //         category: 'Traditional',
// //         restaurantName: 'Amala Sky Restaurant',
// //         images:['/images/foods/amala.jpg'],
// //         ingredients: ['Yam flour', 'Jute leaves', 'Beans', 'Locust beans', 'Palm oil', 'Crayfish', 'Pepper'],
// //         preparationTime: 35,
// //         spicyLevel: 2,
// //         isVegetarian: false,
// //         isPopular: true,
// //         rating: 4.6,
// //         ratingCount: 78,
// //         tags: ['amala', 'ewedu', 'gbegiri', 'yoruba', 'traditional']
// //     },
// //     {
// //         name: 'Ofada Rice with Ayamase',
// //         description: 'Local brown rice served with special green pepper sauce and assorted meats',
// //         price: 4500,
// //         category: 'Rice Dishes',
// //         restaurantName: 'Amala Sky Restaurant',
// //         images: ['/images/foods/ofada.jpg'],
// //         ingredients: ['Ofada rice', 'Green peppers', 'Assorted meats', 'Palm oil', 'Onions', 'Locust beans'],
// //         preparationTime: 40,
// //         spicyLevel: 3,
// //         isVegetarian: false,
// //         isPopular: true,
// //         rating: 4.9,
// //         ratingCount: 112,
// //         tags: ['ofada', 'ayamase', 'special', 'spicy', 'rice']
// //     },
// //     {
// //         name: 'Suya (Spicy Grilled Beef)',
// //         description: 'Spicy grilled beef skewers with traditional suya spices, onions, and tomatoes',
// //         price: 2500,
// //         originalPrice: 3000,
// //         discount: 17,
// //         category: 'Protein',
// //         restaurantName: 'Iya Basira Kitchen',
// //         images: ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop'],
// //         ingredients: ['Beef', 'Suya spices', 'Groundnuts', 'Onions', 'Tomatoes', 'Pepper', 'Ginger'],
// //         preparationTime: 20,
// //         spicyLevel: 3,
// //         isVegetarian: false,
// //         isPopular: true,
// //         rating: 4.7,
// //         ratingCount: 203,
// //         tags: ['suya', 'grilled', 'spicy', 'street-food', 'bbq']
// //     },
// //     {
// //         name: 'Moi Moi with Pap',
// //         description: 'Steamed bean pudding served with fermented corn porridge',
// //         price: 1800,
// //         category: 'Breakfast',
// //         restaurantName: 'Iya Basira Kitchen',
// //         images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'],
// //         ingredients: ['Beans', 'Corn', 'Pepper', 'Onions', 'Fish', 'Eggs', 'Vegetable oil'],
// //         preparationTime: 25,
// //         spicyLevel: 0,
// //         isVegetarian: true,
// //         isPopular: false,
// //         rating: 4.4,
// //         ratingCount: 45,
// //         tags: ['moi-moi', 'pap', 'breakfast', 'vegetarian', 'beans']
// //     }
// // ];

// // export async function GET(request: NextRequest) {
// //     try {
// //         console.log('🌱 SEED ENDPOINT CALLED - FIXED VERSION');

// //         await connectToDatabase();

// //         // Count existing data
// //         const existingRestaurants = await Restaurant.countDocuments();
// //         const existingFoods = await FoodItem.countDocuments();

// //         console.log(`📊 Existing: ${existingRestaurants} restaurants, ${existingFoods} foods`);

// //         // If already seeded, return success
// //         if (existingRestaurants > 0) {
// //             console.log('✅ Database already has data');
// //             return NextResponse.json({
// //                 success: true,
// //                 message: 'Database already seeded',
// //                 existing: {
// //                     restaurants: existingRestaurants,
// //                     foods: existingFoods
// //                 }
// //             });
// //         }

// //         // Clear existing data
// //         console.log('🗑️ Clearing existing data...');
// //         await FoodItem.deleteMany({});
// //         await Restaurant.deleteMany({});

// //         // Create restaurants
// //         console.log('🏪 Creating restaurants...');
// //         const restaurants = await Restaurant.insertMany(sampleRestaurants);
// //         console.log(`✅ Created ${restaurants.length} restaurants`);

// //         // Create restaurant map for food linking
// //         const restaurantMap = new Map();
// //         restaurants.forEach(r => {
// //             restaurantMap.set(r.name, { id: r._id, name: r.name });
// //         });

// //         // Create foods
// //         console.log('🍽️ Creating foods...');
// //         const foodsToInsert = sampleFoods.map(food => {
// //             const restaurant = restaurantMap.get(food.restaurantName);
// //             if (!restaurant) {
// //                 console.error(`❌ Restaurant "${food.restaurantName}" not found! Available:`, Array.from(restaurantMap.keys()));
// //                 throw new Error(`Restaurant "${food.restaurantName}" not found`);
// //             }

// //             return {
// //                 name: food.name,
// //                 description: food.description,
// //                 price: food.price,
// //                 originalPrice: food.originalPrice || null,
// //                 discount: food.discount || 0,
// //                 category: food.category,
// //                 restaurant: restaurant.id,
// //                 restaurantName: restaurant.name,
// //                 images: food.images,
// //                 ingredients: food.ingredients,
// //                 preparationTime: food.preparationTime,
// //                 spicyLevel: food.spicyLevel,
// //                 isVegetarian: food.isVegetarian || false,
// //                 isPopular: food.isPopular || false,
// //                 rating: food.rating,
// //                 ratingCount: food.ratingCount,
// //                 tags: food.tags,
// //                 available: true
// //             };
// //         });

// //         const foods = await FoodItem.insertMany(foodsToInsert);
// //         console.log(`✅ Created ${foods.length} food items`);

// //         // Create summary
// //         const summary = restaurants.map(restaurant => {
// //             const restaurantFoods = foods.filter(f =>
// //                 f.restaurant.toString() === restaurant._id.toString()
// //             );

// //             return {
// //                 restaurant: restaurant.name,
// //                 cuisine: restaurant.cuisineType,
// //                 foodCount: restaurantFoods.length,
// //                 sampleFoods: restaurantFoods.slice(0, 3).map(f => f.name)
// //             };
// //         });

// //         return NextResponse.json({
// //             success: true,
// //             message: 'Database seeded successfully!',
// //             summary: {
// //                 totalRestaurants: restaurants.length,
// //                 totalFoods: foods.length,
// //                 details: summary
// //             },
// //             urls: {
// //                 restaurants: '/api/restaurants',
// //                 foods: '/api/foods',
// //                 viewRestaurants: '/restaurants',
// //                 viewFoods: '/foods'
// //             }
// //         });

// //     } catch (error: any) {
// //         console.error('🔴 SEED ERROR:', error.message);
// //         console.error('🔴 Full error:', error);

// //         return NextResponse.json({
// //             success: false,
// //             message: 'Seeding failed: ' + error.message,
// //             errorDetails: {
// //                 cuisineType: 'Must be lowercase: nigerian, chinese, italian, indian, mexican, american, continental, fast-food',
// //                 openingHours: 'Must be { day: { open: "HH:MM", close: "HH:MM" } } format'
// //             }
// //         }, { status: 500 });
// //     }
// // }

// // app/api/seed/route.ts - UPDATED WITH MATCHING CATEGORIES
// import { NextRequest, NextResponse } from 'next/server';
// import connectToDatabase from '@/lib/db';
// import FoodItem from '@/models/FoodItem';
// import Restaurant from '@/models/Restaurant';

// // Fixed sample restaurants
// const sampleRestaurants = [
//     {
//         name: 'Taste of Osogbo',
//         description: 'Authentic Yoruba cuisine with recipes passed down for generations',
//         cuisineType: 'nigerian',
//         address: {
//             street: '123 Oke-Fia Road',
//             city: 'Osogbo',
//             state: 'Osun State'
//         },
//         contact: {
//             phone: '08012345678',
//             email: 'info@tasteofosogbo.com'
//         },
//         openingHours: {
//             monday: { open: '08:00', close: '22:00' },
//             tuesday: { open: '08:00', close: '22:00' },
//             wednesday: { open: '08:00', close: '22:00' },
//             thursday: { open: '08:00', close: '22:00' },
//             friday: { open: '08:00', close: '23:00' },
//             saturday: { open: '09:00', close: '23:00' },
//             sunday: { open: '10:00', close: '21:00' }
//         },
//         images: ['/images/restaurants/taste-of-osogbo.jpg'], // Local image
//         rating: 4.8,
//         deliveryTime: 25,
//         minimumOrder: 1500,
//         featured: true
//     },
//     {
//         name: 'Amala Sky Restaurant',
//         description: 'Specializing in traditional swallow foods with modern presentation',
//         cuisineType: 'nigerian',
//         address: {
//             street: '45 Ilesa Road',
//             city: 'Osogbo',
//             state: 'Osun State'
//         },
//         contact: {
//             phone: '08087654321',
//             email: 'hello@amalasky.com'
//         },
//         openingHours: {
//             monday: { open: '09:00', close: '22:00' },
//             tuesday: { open: '09:00', close: '22:00' },
//             wednesday: { open: '09:00', close: '22:00' },
//             thursday: { open: '09:00', close: '22:00' },
//             friday: { open: '09:00', close: '23:00' },
//             saturday: { open: '10:00', close: '23:00' },
//             sunday: { open: '11:00', close: '21:00' }
//         },
//         images: ['/images/restaurants/amala-sky.jpg'], // Local image
//         rating: 4.6,
//         deliveryTime: 30,
//         minimumOrder: 1200,
//         featured: true
//     },
//     {
//         name: 'Iya Basira Kitchen',
//         description: 'Home-cooked meals with love and care, just like mama makes',
//         cuisineType: 'nigerian',
//         address: {
//             street: '78 Oke-Baale Street',
//             city: 'Osogbo',
//             state: 'Osun State'
//         },
//         contact: {
//             phone: '08033445566',
//             email: 'iyabasira@kitchen.com'
//         },
//         openingHours: {
//             monday: { open: '07:00', close: '21:00' },
//             tuesday: { open: '07:00', close: '21:00' },
//             wednesday: { open: '07:00', close: '21:00' },
//             thursday: { open: '07:00', close: '21:00' },
//             friday: { open: '07:00', close: '22:00' },
//             saturday: { open: '08:00', close: '22:00' },
//             sunday: { open: '08:00', close: '20:00' }
//         },
//         images: ['/images/restaurants/iya-basira.jpg'], // Local image
//         rating: 4.9,
//         deliveryTime: 35,
//         minimumOrder: 1000,
//         featured: false
//     }
// ];

// // In app/api/seed/route.ts - UPDATE THE sampleFoods array to match homepage categories

// const sampleFoods = [
//     // Traditional Category (Homepage has this but database doesn't)
//     {
//         name: 'Amala with Ewedu & Gbegiri',
//         description: 'Traditional Yoruba dish made from yam flour served with jute leaves soup and bean soup',
//         price: 2800,
//         category: 'Traditional', // This will be created
//         restaurantName: 'Amala Sky Restaurant',
//         images: ['/images/foods/amala.jpg'],
//         ingredients: ['Yam flour', 'Jute leaves', 'Beans', 'Locust beans', 'Palm oil', 'Crayfish', 'Pepper'],
//         preparationTime: 35,
//         spicyLevel: 2,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.6,
//         ratingCount: 78,
//         tags: ['amala', 'ewedu', 'gbegiri', 'yoruba', 'traditional']
//     },
//     {
//         name: 'Pepper Soup with Catfish',
//         description: 'Spicy pepper soup with fresh catfish and traditional herbs',
//         price: 3200,
//         category: 'Traditional',
//         restaurantName: 'Taste of Osogbo',
//         images: ['/images/foods/pepper-soup.jpg'],
//         ingredients: ['Catfish', 'Pepper', 'Traditional herbs', 'Onions', 'Spices'],
//         preparationTime: 25,
//         spicyLevel: 3,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.7,
//         ratingCount: 92,
//         tags: ['pepper-soup', 'catfish', 'soup', 'spicy', 'traditional']
//     },

//     // Rice Dishes Category (Already exists in database)
//     {
//         name: 'Jollof Rice with Grilled Chicken',
//         description: 'Classic Nigerian party rice with perfectly grilled chicken, served with fried plantains',
//         price: 3500,
//         category: 'Rice Dishes',
//         restaurantName: 'Taste of Osogbo',
//         images: ['/images/foods/jollof-rice.jpg'],
//         ingredients: ['Rice', 'Tomatoes', 'Bell peppers', 'Chicken', 'Spices', 'Onions', 'Vegetable oil'],
//         preparationTime: 30,
//         spicyLevel: 2,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.8,
//         ratingCount: 156,
//         tags: ['jollof', 'rice', 'chicken', 'party', 'popular', 'nigerian']
//     },
//     {
//         name: 'Ofada Rice with Ayamase',
//         description: 'Local brown rice served with special green pepper sauce and assorted meats',
//         price: 4500,
//         category: 'Rice Dishes',
//         restaurantName: 'Amala Sky Restaurant',
//         images: ['/images/foods/ofada.jpg'],
//         ingredients: ['Ofada rice', 'Green peppers', 'Assorted meats', 'Palm oil', 'Onions', 'Locust beans'],
//         preparationTime: 40,
//         spicyLevel: 3,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.9,
//         ratingCount: 112,
//         tags: ['ofada', 'ayamase', 'special', 'spicy', 'rice']
//     },

//     // Swallow Category (Homepage has this but database doesn't)
//     {
//         name: 'Pounded Yam with Egusi Soup',
//         description: 'Smooth pounded yam served with rich melon seed soup and assorted meats',
//         price: 4000,
//         originalPrice: 4500,
//         discount: 11,
//         category: 'Swallow', // This will be created
//         restaurantName: 'Taste of Osogbo',
//         images: ['/images/foods/pounded-yam.jpg'],
//         ingredients: ['Yam', 'Melon seeds', 'Assorted meats', 'Spinach', 'Palm oil', 'Crayfish', 'Pepper'],
//         preparationTime: 45,
//         spicyLevel: 1,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.9,
//         ratingCount: 89,
//         tags: ['pounded-yam', 'egusi', 'swallow', 'traditional', 'soup']
//     },
//     {
//         name: 'Eba with Ogbono Soup',
//         description: 'Garri (eba) served with viscous ogbono soup and assorted meats',
//         price: 2500,
//         category: 'Swallow',
//         restaurantName: 'Iya Basira Kitchen',
//         images: ['/images/foods/eba-ogbono.jpg'],
//         ingredients: ['Garri', 'Ogbono seeds', 'Assorted meats', 'Vegetables', 'Palm oil', 'Crayfish'],
//         preparationTime: 30,
//         spicyLevel: 2,
//         isVegetarian: false,
//         isPopular: false,
//         rating: 4.3,
//         ratingCount: 45,
//         tags: ['eba', 'ogbono', 'swallow', 'soup']
//     },

//     // Protein Category (Already exists in database)
//     {
//         name: 'Suya (Spicy Grilled Beef)',
//         description: 'Spicy grilled beef skewers with traditional suya spices, onions, and tomatoes',
//         price: 2500,
//         originalPrice: 3000,
//         discount: 17,
//         category: 'Protein',
//         restaurantName: 'Iya Basira Kitchen',
//         images: ['/images/foods/suya.jpg'],
//         ingredients: ['Beef', 'Suya spices', 'Groundnuts', 'Onions', 'Tomatoes', 'Pepper', 'Ginger'],
//         preparationTime: 20,
//         spicyLevel: 3,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.7,
//         ratingCount: 203,
//         tags: ['suya', 'grilled', 'spicy', 'street-food', 'bbq']
//     },
//     {
//         name: 'Grilled Chicken with Plantain',
//         description: 'Juicy grilled chicken served with fried plantains and special sauce',
//         price: 3200,
//         category: 'Protein',
//         restaurantName: 'Amala Sky Restaurant',
//         images: ['/images/foods/grilled-chicken.jpg'],
//         ingredients: ['Chicken', 'Plantains', 'Special sauce', 'Spices', 'Vegetable oil'],
//         preparationTime: 25,
//         spicyLevel: 1,
//         isVegetarian: false,
//         isPopular: true,
//         rating: 4.5,
//         ratingCount: 98,
//         tags: ['chicken', 'grilled', 'plantain', 'protein']
//     },

//     // Keep existing Breakfast category items if you want
//     {
//         name: 'Moi Moi with Pap',
//         description: 'Steamed bean pudding served with fermented corn porridge',
//         price: 1800,
//         category: 'Breakfast',
//         restaurantName: 'Iya Basira Kitchen',
//         images: ['/images/foods/moinmoin.jpg'],
//         ingredients: ['Beans', 'Corn', 'Pepper', 'Onions', 'Fish', 'Eggs', 'Vegetable oil'],
//         preparationTime: 25,
//         spicyLevel: 0,
//         isVegetarian: true,
//         isPopular: false,
//         rating: 4.4,
//         ratingCount: 45,
//         tags: ['moi-moi', 'pap', 'breakfast', 'vegetarian', 'beans']
//     }
// ];

// export async function GET(request: NextRequest) {
//     try {
//         console.log('🌱 SEED ENDPOINT CALLED - UPDATED CATEGORIES');

//         await connectToDatabase();

//         // Count existing data
//         const existingRestaurants = await Restaurant.countDocuments();
//         const existingFoods = await FoodItem.countDocuments();

//         console.log(`📊 Existing: ${existingRestaurants} restaurants, ${existingFoods} foods`);

//         // If already seeded, return success
//         if (existingRestaurants > 0) {
//             console.log('✅ Database already has data');
//             return NextResponse.json({
//                 success: true,
//                 message: 'Database already seeded',
//                 existing: {
//                     restaurants: existingRestaurants,
//                     foods: existingFoods
//                 }
//             });
//         }

//         // Clear existing data
//         console.log('🗑️ Clearing existing data...');
//         await FoodItem.deleteMany({});
//         await Restaurant.deleteMany({});

//         // Create restaurants
//         console.log('🏪 Creating restaurants...');
//         const restaurants = await Restaurant.insertMany(sampleRestaurants);
//         console.log(`✅ Created ${restaurants.length} restaurants`);

//         // Create restaurant map for food linking
//         const restaurantMap = new Map();
//         restaurants.forEach(r => {
//             restaurantMap.set(r.name, { id: r._id, name: r.name });
//         });

//         // Create foods
//         console.log('🍽️ Creating foods...');
//         const foodsToInsert = sampleFoods.map(food => {
//             const restaurant = restaurantMap.get(food.restaurantName);
//             if (!restaurant) {
//                 console.error(`❌ Restaurant "${food.restaurantName}" not found! Available:`, Array.from(restaurantMap.keys()));
//                 throw new Error(`Restaurant "${food.restaurantName}" not found`);
//             }

//             return {
//                 name: food.name,
//                 description: food.description,
//                 price: food.price,
//                 originalPrice: food.originalPrice || null,
//                 discount: food.discount || 0,
//                 category: food.category,
//                 restaurant: restaurant.id,
//                 restaurantName: restaurant.name,
//                 images: food.images,
//                 ingredients: food.ingredients,
//                 preparationTime: food.preparationTime,
//                 spicyLevel: food.spicyLevel,
//                 isVegetarian: food.isVegetarian || false,
//                 isPopular: food.isPopular || false,
//                 rating: food.rating,
//                 ratingCount: food.ratingCount,
//                 tags: food.tags,
//                 available: true
//             };
//         });

//         const foods = await FoodItem.insertMany(foodsToInsert);
//         console.log(`✅ Created ${foods.length} food items`);

//         // Log category distribution
//         const categoryCounts = foods.reduce((acc, food) => {
//             acc[food.category] = (acc[food.category] || 0) + 1;
//             return acc;
//         }, {} as Record<string, number>);

//         console.log('📊 Category distribution:', categoryCounts);

//         // Create summary
//         const summary = restaurants.map(restaurant => {
//             const restaurantFoods = foods.filter(f =>
//                 f.restaurant.toString() === restaurant._id.toString()
//             );

//             return {
//                 restaurant: restaurant.name,
//                 cuisine: restaurant.cuisineType,
//                 foodCount: restaurantFoods.length,
//                 categories: [...new Set(restaurantFoods.map(f => f.category))],
//                 sampleFoods: restaurantFoods.slice(0, 3).map(f => f.name)
//             };
//         });

//         return NextResponse.json({
//             success: true,
//             message: 'Database seeded successfully with updated categories!',
//             summary: {
//                 totalRestaurants: restaurants.length,
//                 totalFoods: foods.length,
//                 categories: categoryCounts,
//                 details: summary
//             },
//             urls: {
//                 restaurants: '/api/restaurants',
//                 foods: '/api/foods',
//                 viewRestaurants: '/restaurants',
//                 viewFoods: '/foods'
//             },
//             note: 'Categories now match homepage: Traditional, Swallow, Protein, Snacks'
//         });

//     } catch (error: any) {
//         console.error('🔴 SEED ERROR:', error.message);
//         console.error('🔴 Full error:', error);

//         return NextResponse.json({
//             success: false,
//             message: 'Seeding failed: ' + error.message,
//             errorDetails: {
//                 cuisineType: 'Must be lowercase: nigerian, chinese, italian, indian, mexican, american, continental, fast-food',
//                 openingHours: 'Must be { day: { open: "HH:MM", close: "HH:MM" } } format'
//             }
//         }, { status: 500 });
//     }
// }