// app/api/orders/time-tracker/route.ts - USE THIS ONE
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
    const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            console.log('🔄 Time tracker SSE connected');

            const sendUpdate = async () => {
                try {
                    await connectToDatabase();
                    const now = new Date();
                    
                    const orders = await Order.find({
                        status: { $in: ['confirmed', 'preparing', 'ready'] },
                        estimatedDeliveryTime: { $gt: now }
                    }).select('_id orderNumber status estimatedDeliveryTime');

                    const timeData = orders.map(order => {
                        const remainingMs = order.estimatedDeliveryTime.getTime() - now.getTime();
                        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));
                        
                        return {
                            orderId: order._id.toString(),
                            orderNumber: order.orderNumber,
                            remainingMinutes,
                            status: order.status
                        };
                    });

                    const data = JSON.stringify({
                        timestamp: now.toISOString(),
                        orders: timeData
                    });

                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch (error) {
                    console.error('Time tracker error:', error);
                }
            };

            // Send initial data
            await sendUpdate();

            // Send updates every 30 seconds
            const interval = setInterval(sendUpdate, 30000);

            // Clean up on disconnect
            request.signal.addEventListener('abort', () => {
                console.log('🔌 Time tracker SSE disconnected');
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(stream, { headers });
}