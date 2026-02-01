import React from 'react';

const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-gray-100',
    danger: 'bg-status-error text-white hover:opacity-90',
    warning: 'bg-status-warning text-white hover:opacity-90',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}) => {
    return (
        <button
            className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
        rounded-lg font-medium transition-all duration-200 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
