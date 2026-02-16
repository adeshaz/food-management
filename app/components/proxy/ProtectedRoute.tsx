import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/proxy-auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default async function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const user = await getAuthUser();

    if (!user) {
        redirect('/signin');
    }

    if (requireAdmin && user.role !== 'admin') {
        redirect('/');
    }

    return <>{children}</>;
}