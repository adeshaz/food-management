// app/orders/page.tsx - NEW FILE
import { redirect } from 'next/navigation';

export default function OrdersPage() {
    redirect('/dashboard/orders');
}