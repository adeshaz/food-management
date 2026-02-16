// app/layout.tsx - UPDATED
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext'; // Add AuthProvider
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Osogbo Foods - Taste the Tradition',
  description: 'Order authentic Osogbo cuisine from the best local restaurants',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider> {/* Wrap everything with AuthProvider */}
          <CartProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

