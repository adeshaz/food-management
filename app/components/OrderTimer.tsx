// components/OrderTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface OrderTimerProps {
    estimatedDelivery: Date;
    orderId: string;
}

export default function OrderTimer({ estimatedDelivery, orderId }: OrderTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isPastDue, setIsPastDue] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const deliveryTime = new Date(estimatedDelivery);
            const diff = deliveryTime.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeft('Delayed');
                setIsPastDue(true);
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
            
            setIsPastDue(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [estimatedDelivery]);

    return (
        <div className={`flex items-center gap-2 ${isPastDue ? 'text-red-600' : 'text-amber-600'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-medium">{timeLeft}</span>
            {isPastDue && <span className="text-xs">(Contact support)</span>}
        </div>
    );
}