'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroCarouselProps {
    images: string[];
    interval?: number;
}

export function HeroCarousel({ images, interval = 5000 }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [images.length, interval]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {images.map((src, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentIndex ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={src}
                        alt={`Hero image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        quality={90}
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                </motion.div>
            ))}

            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all ${index === currentIndex
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}