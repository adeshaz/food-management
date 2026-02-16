// components/PhoneCallButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PhoneCallButtonProps {
    phoneNumber: string;
    label?: string;
    variant?: 'call' | 'whatsapp';
    className?: string;
}

export default function PhoneCallButton({ 
    phoneNumber, 
    label = 'Call', 
    variant = 'call',
    className = ''
}: PhoneCallButtonProps) {
    
    const formatPhoneNumber = (phone: string) => {
        // Remove all non-numeric characters
        return phone.replace(/\D/g, '');
    };
    
    const handleClick = () => {
        const cleanNumber = formatPhoneNumber(phoneNumber);
        
        if (variant === 'whatsapp') {
            // Open WhatsApp
            window.open(`https://wa.me/${cleanNumber}?text=Hello%20I%20need%20assistance%20with%20my%20order%20from%20Osogbo%20Foods`, '_blank');
            toast.success('Opening WhatsApp...');
        } else {
            // Initiate phone call
            window.location.href = `tel:${phoneNumber}`;
            toast.success('Initiating call...');
        }
    };
    
    return (
        <Button
            onClick={handleClick}
            className={`${className} ${
                variant === 'whatsapp' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            {variant === 'whatsapp' ? (
                <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {label}
                </>
            ) : (
                <>
                    <Phone className="h-4 w-4 mr-2" />
                    {label}
                </>
            )}
        </Button>
    );
}