// app/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { FaUtensils, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <FaUtensils className="text-2xl text-green-400" />
                            <span className="text-xl font-bold">Osogbo<span className="text-green-400">Foods</span></span>
                        </div>
                        <p className="text-gray-300">
                            Taste the tradition. Order authentic local cuisine from the best restaurants in Osogbo.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/restaurants" className="text-gray-300 hover:text-green-400 transition-colors">Restaurants</Link></li>
                            <li><Link href="/foods" className="text-gray-300 hover:text-green-400 transition-colors">Food Menu</Link></li>
                            <li><Link href="/map" className="text-gray-300 hover:text-green-400 transition-colors">Food Map</Link></li>
                            <li><Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                        <div className="space-y-2 text-gray-300">
                            <div className="flex items-center space-x-2">
                                <FaMapMarkerAlt />
                                <span>Osogbo, Osun State</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaPhone />
                                <span>+234 903 727 2637</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaEnvelope />
                                <span>
                                    {/* hello@osogbofoods.com */}
                                    hafizadegbite@gmail.com
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                        <div className="text-gray-300 space-y-1">
                            <p>Monday - Sunday</p>
                            <p>7:00 AM - 10:00 PM</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
                    <p>&copy; {new Date().getFullYear()} Osogbo Foods. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;