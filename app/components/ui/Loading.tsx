// app/components/ui/Loading.tsx
import React from 'react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex items-center justify-center space-x-2 p-4">
            <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}></div>
            {text && <span className="text-gray-600">{text}</span>}
        </div>
    );
};

export default Loading;