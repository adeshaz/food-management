// app/components/Map.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Restaurant } from "@/types/restaurant";
import "leaflet/dist/leaflet.css";

// --- Dynamic Imports (Avoid SSR Errors) ---
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);

const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);

const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

// --------------------------------------------------------------------

interface FoodMapProps {
    restaurants: Restaurant[];
}

const FoodMap: React.FC<FoodMapProps> = ({ restaurants }) => {
    const [mounted, setMounted] = useState(false);

    const osogboCenter: [number, number] = [7.7827, 4.5418];

    // Prevent SSR and fix Leaflet icons
    useEffect(() => {
        setMounted(true);

        (async () => {
            const L = await import("leaflet");

            delete (L.Icon.Default.prototype as any)._getIconUrl;

            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });
        })();
    }, []);

    if (!mounted) {
        return (
            <div className="h-[500px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p>Loading map...</p>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden">
            <MapContainer
                center={osogboCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {restaurants.map((restaurant) => (
                    <Marker
                        key={restaurant._id}
                        position={[
                            restaurant.location.coordinates.lat,
                            restaurant.location.coordinates.lng,
                        ]}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>

                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-20 object-cover rounded mb-2"
                                />

                                <p className="text-sm text-gray-600 mb-2">
                                    {restaurant.location.address}
                                </p>

                                <p className="text-sm mb-2">Rating: {restaurant.rating} ⭐</p>

                                <p className="text-sm mb-3">
                                    {restaurant.menu.length} menu items
                                </p>

                                <a
                                    href={`/restaurants/${restaurant._id}`}
                                    className="block bg-primary text-white px-3 py-1 rounded text-sm text-center hover:bg-orange-600"
                                >
                                    View Menu
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FoodMap;