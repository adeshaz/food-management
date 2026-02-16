// app/page.tsx - UPDATED WITH REAL DATA FETCHING
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Shield,
  Truck,
  Star,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  ShoppingBag,
  Coffee,
  ChefHat,
  Leaf,
  Flame,
  Utensils,
  Phone,
  Mail,
  Map,
  CheckCircle,
  Users,
  Zap,
  Heart,
  Truck as DeliveryTruck,
  ThumbsUp,
  Package,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// High-quality Nigerian/African food images from Unsplash
const heroBackgrounds = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
];

const categoryBackgrounds = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
];

const restaurantBackgrounds = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554679665-f5537f187268?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const featureBackground = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80';
const ctaBackground = 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80';

// Interface for restaurant data from API
interface Restaurant {
  _id: string;
  id: string;
  name: string;
  description: string;
  rating: number;
  featured: boolean;
  cuisineType: string;
  deliveryTime: number;
  minimumOrder: number;
  images: string[];
  isOpen?: boolean;
}

// Interface for categories data
interface CategoryData {
  [key: string]: number;
}

const features = [
  {
    icon: <Clock className="h-10 w-10" />,
    title: "Fast Delivery",
    description: "Get your food delivered in 30 minutes or less across Osogbo",
    color: "bg-gradient-to-br from-emerald-500 to-green-600",
  },
  {
    icon: <Shield className="h-10 w-10" />,
    title: "Food Safety",
    description: "All restaurants maintain highest hygiene and safety standards",
    color: "bg-gradient-to-br from-blue-500 to-cyan-600",
  },
  {
    icon: <Award className="h-10 w-10" />,
    title: "Quality Rated",
    description: "Every restaurant is quality checked and customer rated",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    icon: <Truck className="h-10 w-10" />,
    title: "Live Tracking",
    description: "Track your order in real-time from kitchen to doorstep",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Choose Your Food",
    description: "Browse from our wide selection of restaurants and dishes",
    icon: <Utensils className="h-8 w-8" />
  },
  {
    step: "02",
    title: "Place Your Order",
    description: "Add items to cart and checkout with secure payment",
    icon: <ShoppingBag className="h-8 w-8" />
  },
  {
    step: "03",
    title: "Enjoy Your Meal",
    description: "Track delivery and enjoy fresh, delicious food",
    icon: <CheckCircle className="h-8 w-8" />
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Array<{
    id: number;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    count: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [stats, setStats] = useState([
    { value: "0", label: "Restaurants", icon: <Utensils className="h-5 w-5" /> },
    { value: "0", label: "Dishes", icon: <Package className="h-5 w-5" /> },
    { value: "0", label: "Avg Rating", icon: <Star className="h-5 w-5" /> },
    { value: "0", label: "Avg Delivery", icon: <DeliveryTruck className="h-5 w-5" /> },
    { value: "24/7", label: "Support", icon: <Phone className="h-5 w-5" /> },
    { value: "0", label: "Happy Customers", icon: <Users className="h-5 w-5" /> }
  ]);

  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const cartCount = itemCount;

  // Fetch all data on component mount
  useEffect(() => {
    fetchHomePageData();

    // Set up interval for auto-refresh (every 30 seconds)
    const interval = setInterval(fetchHomePageData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Background carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBackgrounds.length);
        setIsVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to fetch all homepage data
  const fetchHomePageData = async () => {
    setLoading(true);

    try {
      // Fetch featured restaurants
      await fetchFeaturedRestaurants();

      // Fetch categories with counts
      await fetchCategories();

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured restaurants from API
  const fetchFeaturedRestaurants = async () => {
    try {
      setRestaurantsLoading(true);
      const response = await fetch('/api/restaurants?featured=true&limit=6');

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data) {
          // Transform API data to match your frontend format
          const restaurants = data.data.map((restaurant: any) => ({
            ...restaurant,
            // Ensure we have all required properties
            id: restaurant._id || restaurant.id,
            deliveryTime: restaurant.deliveryTime || 30,
            rating: restaurant.rating || 4.0,
            isOpen: true // You can add actual logic here based on opening hours
          }));

          setFeaturedRestaurants(restaurants);
        } else {
          console.error('API returned error:', data.error);
        }
      } else {
        console.error('Failed to fetch restaurants:', response.status);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  // Fetch categories with counts
  const fetchCategories = async () => {
    try {
      // First, try to get categories from foods API
      const response = await fetch('/api/foods/categories');

      if (response.ok) {
        const categoryData: CategoryData = await response.json();

        // Define your categories with dynamic counts
        const categoriesList = [
          {
            id: 1,
            name: "Traditional",
            description: "Traditional Yoruba dishes like Amala, Ewedu, Gbegiri",
            icon: <ChefHat className="h-8 w-8" />,
            color: "from-orange-500 to-amber-600",
            gradient: "bg-gradient-to-br from-orange-500/90 to-amber-600/90",
            count: categoryData["Traditional"] || 0
          },
          {
            id: 2,
            name: "Rice Dishes",
            description: "Jollof Rice, Ofada Rice, Fried Rice, Coconut Rice",
            icon: <Utensils className="h-8 w-8" />,
            color: "from-blue-500 to-indigo-600",
            gradient: "bg-gradient-to-br from-blue-500/90 to-indigo-600/90",
            count: categoryData["Rice Dishes"] || categoryData["Rice"] || 0
          },
          {
            id: 3,
            name: "Swallow",
            description: "Amala, Pounded Yam, Eba with assorted soups",
            icon: <Leaf className="h-8 w-8" />,
            color: "from-emerald-500 to-green-600",
            gradient: "bg-gradient-to-br from-emerald-500/90 to-green-600/90",
            count: categoryData["Swallow"] || 0
          },
          {
            id: 4,
            name: "Protein",
            description: "Suya, Chicken, Fish, Asun, Grilled Meats",
            icon: <Flame className="h-8 w-8" />,
            color: "from-red-500 to-rose-600",
            gradient: "bg-gradient-to-br from-red-500/90 to-rose-600/90",
            count: categoryData["Protein"] || categoryData["Meat"] || 0
          },
          {
            id: 5,
            name: "Breakfast",
            description: "Moi Moi, Pap, Akara, Fried Plantains",
            icon: <Coffee className="h-8 w-8" />,
            color: "from-purple-500 to-pink-600",
            gradient: "bg-gradient-to-br from-purple-500/90 to-pink-600/90",
            count: categoryData["Breakfast"] || categoryData["Snacks"] || 0
          }
        ];

        setCategories(categoriesList);
      } else {
        // Fallback to default categories if API fails
        setDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setDefaultCategories();
    }
  };

  // Set default categories (fallback)
  const setDefaultCategories = () => {
    const defaultCategories = [
      {
        id: 1,
        name: "Traditional",
        description: "Traditional Yoruba dishes like Amala, Ewedu, Gbegiri",
        icon: <ChefHat className="h-8 w-8" />,
        color: "from-orange-500 to-amber-600",
        gradient: "bg-gradient-to-br from-orange-500/90 to-amber-600/90",
        count: 0
      },
      {
        id: 2,
        name: "Rice Dishes",
        description: "Jollof Rice, Ofada Rice, Fried Rice, Coconut Rice",
        icon: <Utensils className="h-8 w-8" />,
        color: "from-blue-500 to-indigo-600",
        gradient: "bg-gradient-to-br from-blue-500/90 to-indigo-600/90",
        count: 0
      },
      {
        id: 3,
        name: "Swallow",
        description: "Amala, Pounded Yam, Eba with assorted soups",
        icon: <Leaf className="h-8 w-8" />,
        color: "from-emerald-500 to-green-600",
        gradient: "bg-gradient-to-br from-emerald-500/90 to-green-600/90",
        count: 0
      },
      {
        id: 4,
        name: "Protein",
        description: "Suya, Chicken, Fish, Asun, Grilled Meats",
        icon: <Flame className="h-8 w-8" />,
        color: "from-red-500 to-rose-600",
        gradient: "bg-gradient-to-br from-red-500/90 to-rose-600/90",
        count: 0
      },
      {
        id: 5,
        name: "Breakfast",
        description: "Moi Moi, Pap, Akara, Fried Plantains",
        icon: <Coffee className="h-8 w-8" />,
        color: "from-purple-500 to-pink-600",
        gradient: "bg-gradient-to-br from-purple-500/90 to-pink-600/90",
        count: 0
      }
    ];

    setCategories(defaultCategories);
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      // Fetch restaurants count
      const restaurantsResponse = await fetch('/api/restaurants');
      let restaurantCount = 0;
      let avgRating = 0;
      let avgDelivery = 0;

      if (restaurantsResponse.ok) {
        const restaurantsData = await restaurantsResponse.json();
        if (restaurantsData.success) {
          restaurantCount = restaurantsData.count || restaurantsData.data?.length || 0;

          // Calculate average rating and delivery time
          if (restaurantsData.data && restaurantsData.data.length > 0) {
            const totalRating = restaurantsData.data.reduce((sum: number, r: any) => sum + (r.rating || 4.0), 0);
            const totalDelivery = restaurantsData.data.reduce((sum: number, r: any) => sum + (r.deliveryTime || 30), 0);

            avgRating = totalRating / restaurantsData.data.length;
            avgDelivery = totalDelivery / restaurantsData.data.length;
          }
        }
      }

      // Fetch foods count
      const foodsResponse = await fetch('/api/foods');
      let foodCount = 0;

      if (foodsResponse.ok) {
        const foodsData = await foodsResponse.json();
        if (foodsData.success) {
          foodCount = foodsData.count || foodsData.data?.length || 0;
        }
      }

      // Update stats
      setStats([
        { value: `${restaurantCount}+`, label: "Restaurants", icon: <Utensils className="h-5 w-5" /> },
        { value: `${foodCount}+`, label: "Dishes", icon: <Package className="h-5 w-5" /> },
        { value: `${avgRating.toFixed(1)}★`, label: "Avg Rating", icon: <Star className="h-5 w-5" /> },
        { value: `${Math.round(avgDelivery)}m`, label: "Avg Delivery", icon: <DeliveryTruck className="h-5 w-5" /> },
        { value: "24/7", label: "Support", icon: <Phone className="h-5 w-5" /> },
        { value: "5K+", label: "Happy Customers", icon: <Users className="h-5 w-5" /> }
      ]);

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Generate tags for restaurant based on data
  const generateRestaurantTags = (restaurant: Restaurant): string[] => {
    const tags: string[] = [];

    if (restaurant.featured) tags.push("Featured");
    if (restaurant.rating >= 4.5) tags.push("Top Rated");
    if (restaurant.deliveryTime <= 25) tags.push("Fast Delivery");

    // Add cuisine type as tag
    const cuisine = restaurant.cuisineType || "Nigerian";
    tags.push(cuisine.charAt(0).toUpperCase() + cuisine.slice(1));

    return tags;
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* ========== HERO SECTION WITH BACKGROUND ========== */}
      <section className="relative min-h-[90vh] overflow-hidden pt-16">
        {/* Dynamic Background Carousel */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${heroBackgrounds[currentSlide]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }}
            />
          </AnimatePresence>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-6 border border-white/20"
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Osogbo's #1 Food Delivery</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                <span className="text-white">Taste</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-300">
                  Osogbo's Soul
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed"
              >
                Experience authentic local cuisine, crafted with generations of tradition
                and delivered with modern convenience right to your doorstep in Osogbo.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="max-w-2xl"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex items-center px-4 py-3">
                      <MapPin className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter your location in Osogbo..."
                        className="w-full bg-transparent text-white outline-none placeholder-gray-300 text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 px-8 py-6 rounded-xl font-semibold text-lg whitespace-nowrap"
                    >
                      <Link href="/restaurants">
                        <Search className="h-5 w-5 mr-2" />
                        Find Food Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid with Background */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mt-12"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                    >
                      <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-full bg-emerald-500/20">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-300 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronRight className="h-8 w-8 text-white rotate-90" />
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Zap className="h-4 w-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Order in <span className="text-emerald-600">3 Easy Steps</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get your favorite Osogbo dishes delivered fresh to your doorstep
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow h-full">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold text-gray-100 mb-4 absolute top-4 right-4">
                      {step.step}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                      <div className="text-emerald-600">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION WITH BACKGROUND ========== */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98)), url(${featureBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-emerald-600">Osogbo Foods</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine tradition with technology for the best dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES SECTION ========== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Popular Categories</h2>
              <p className="text-gray-600">Explore our diverse food selection</p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700"
            >
              <Link href="/foods">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link href={`/foods?category=${category.name}`}>
                  <Card className="h-80 overflow-hidden border-none shadow-lg group-hover:shadow-2xl transition-all">
                    <div className="relative h-48">
                      {/* Category Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${categoryBackgrounds[index % categoryBackgrounds.length]})` }}
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 ${category.gradient}`} />
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {category.icon}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          {category.count} items
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED RESTAURANTS SECTION ========== */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
              <Star className="h-4 w-4 mr-2 fill-current" />
              {restaurantsLoading ? 'Loading...' : 'Top Rated'}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {restaurantsLoading ? 'Loading Restaurants...' : 'Featured Restaurants'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {restaurantsLoading ? 'Fetching the best restaurants...' : 'Top-rated eateries in Osogbo'}
            </p>
          </div>

          {restaurantsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading restaurants from database...</p>
              </div>
            </div>
          ) : featuredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Utensils className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Featured Restaurants Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add featured restaurants through your admin panel to see them here.
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/admin">
                  Go to Admin Panel
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.slice(0, 6).map((restaurant, index) => {
                const tags = generateRestaurantTags(restaurant);

                return (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all h-full">
                      <div className="relative h-48">
                        {/* Dynamic restaurant image */}
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: restaurant.images && restaurant.images.length > 0
                              ? `url(${restaurant.images[0]})`
                              : `url(${restaurantBackgrounds[index % restaurantBackgrounds.length]})`
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            Open Now
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            {restaurant.rating.toFixed(1)}
                          </Badge>
                        </div>
                        {restaurant.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-purple-500 hover:bg-purple-600">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {restaurant.description || `${restaurant.cuisineType} cuisine`}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{restaurant.deliveryTime} min • Min. order: ₦{restaurant.minimumOrder.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                        >
                          <Link href={`/restaurants/${restaurant.id}`}>
                            View Menu & Order
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* View All Restaurants Button */}
          {!restaurantsLoading && featuredRestaurants.length > 0 && (
            <div className="text-center mt-12">
              <Button
                asChild
                variant="outline"
                className="px-8 py-6 text-lg"
              >
                <Link href="/restaurants">
                  View All Restaurants
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ========== CTA SECTION WITH BACKGROUND ========== */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${ctaBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white backdrop-blur-sm border-white/30">
              <Heart className="h-4 w-4 mr-2" />
              Join Our Community
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Taste <span className="text-yellow-300">Osogbo</span>?
            </h2>

            <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
              {featuredRestaurants.length > 0
                ? `Join thousands of food lovers enjoying ${featuredRestaurants.length}+ restaurants`
                : 'Discover authentic local cuisine delivered fresh to your doorstep'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
                  >
                    <Link href="/foods">
                      <ShoppingBag className="h-5 w-5 mr-3" />
                      Order Now {cartCount > 0 && `(${cartCount} items)`}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  >
                    <Link href="/restaurants">
                      Browse Restaurants
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
                  >
                    <Link href="/signup">
                      <Users className="h-5 w-5 mr-3" />
                      Start Ordering Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  >
                    <Link href="/restaurants">
                      Browse Restaurants
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Phone className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Call Us</p>
                    <p className="text-emerald-200">+234 903 727 2637</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Mail className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email Us</p>
                    <p className="text-emerald-200">hafizadegbite@gmail.com</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Map className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Visit Us</p>
                    <p className="text-emerald-200">Osogbo, Osun State</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}