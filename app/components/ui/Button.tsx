// app/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    className = '',
    loading = false
}) => {
    const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-orange-600 focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-orange-500 focus:ring-secondary',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={classes}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;