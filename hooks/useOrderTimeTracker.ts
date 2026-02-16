// hooks/useOrderTimeTracker.ts
import { useState, useEffect } from 'react';

export function useOrderTimeTracker(orderId: string) {
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [formattedTime, setFormattedTime] = useState('');

    useEffect(() => {
        const eventSource = new EventSource(`/api/orders/time-tracker`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const orderData = Array.isArray(data)
                ? data.find(o => o.orderId === orderId)
                : data;

            if (orderData) {
                setRemainingTime(orderData.remainingMinutes);

                // Format time
                const hours = Math.floor(orderData.remainingMinutes / 60);
                const minutes = orderData.remainingMinutes % 60;

                if (hours > 0) {
                    setFormattedTime(`${hours}h ${minutes}m`);
                } else {
                    setFormattedTime(`${minutes}m`);
                }
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [orderId]);

    return { remainingTime, formattedTime };
}