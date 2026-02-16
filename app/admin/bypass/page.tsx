// // app/admin/bypass/page.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function AdminBypassPage() {
//     const router = useRouter();

//     useEffect(() => {
//         // Set admin cookies - THIS IS LIKE GIVING YOU A MASTER KEY
//         document.cookie = 'admin_token=dev_admin_bypass; path=/; max-age=86400';
//         document.cookie = 'user_role=admin; path=/; max-age=86400';

//         // Wait 1 second and then go to admin
//         setTimeout(() => {
//             router.push('/admin/orders');
//         }, 1000);
//     }, [router]);

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col items-center justify-center p-4">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
//                 <h1 className="text-2xl font-bold text-emerald-700 mb-2">Giving You Admin Superpowers! 🦸</h1>
//                 <p className="text-gray-600">Setting up admin access...</p>
//                 <p className="text-sm text-gray-500 mt-4">You'll be redirected in 1 second</p>
//             </div>
//         </div>
//     );
// }