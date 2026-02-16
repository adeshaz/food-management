// // 'use client';

// // import { Button } from '@/components/ui/button';
// // import { LogOut } from 'lucide-react';
// // import { toast } from 'sonner';

// // export default function LogoutButton() {
// //     const handleLogout = async () => {
// //         try {
// //             const response = await fetch('/api/auth/logout', {
// //                 method: 'POST',
// //                 credentials: 'include',
// //             });

// //             if (response.ok) {
// //                 toast.success('Logged out successfully');
// //                 // Full page reload to trigger proxy check
// //                 window.location.href = '/signin';
// //             } else {
// //                 toast.error('Failed to logout');
// //             }
// //         } catch (error) {
// //             toast.error('An error occurred');
// //         }
// //     };

// //     return (
// //         <Button
// //             variant="ghost"
// //             onClick={handleLogout}
// //             className="gap-2 hover:bg-red-50 hover:text-red-600"
// //         >
// //             <LogOut className="h-4 w-4" />
// //             Logout
// //         </Button>
// //     );
// // }

// // components/auth/LogoutButton.tsx - FIXED
// 'use client';

// import { Button } from '@/components/ui/button';
// import { LogOut } from 'lucide-react';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// export default function LogoutButton() {
//     const router = useRouter();

//     const handleLogout = async () => {
//         try {
//             const response = await fetch('/api/auth/logout', {
//                 method: 'POST',
//                 credentials: 'include',
//             });

//             if (response.ok) {
//                 toast.success('Logged out successfully');
//                 // Clear any local storage
//                 localStorage.clear();
//                 // Use replace to prevent back button issues
//                 window.location.replace('/signin');
//             } else {
//                 toast.error('Failed to logout');
//             }
//         } catch (error) {
//             console.error('Logout error:', error);
//             toast.error('An error occurred');
//             // Fallback redirect
//             window.location.href = '/signin';
//         }
//     };

//     return (
//         <Button
//             variant="ghost"
//             onClick={handleLogout}
//             className="gap-2 hover:bg-red-50 hover:text-red-600"
//         >
//             <LogOut className="h-4 w-4" />
//             Logout
//         </Button>
//     );
// }



// components/auth/LogoutButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface LogoutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showIcon?: boolean;
    label?: string;
}

export default function LogoutButton({
    variant = 'ghost',
    size = 'default',
    className = '',
    showIcon = true,
    label = 'Logout'
}: LogoutButtonProps) {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleLogout}
            disabled={loading}
            className={`hover:bg-red-50 hover:text-red-600 ${className}`}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : showIcon ? (
                <LogOut className="h-4 w-4 mr-2" />
            ) : null}
            {label}
        </Button>
    );
}