import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    id,
    type = 'text',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-text-heading">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`
          w-full px-4 py-2 rounded-lg border 
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all duration-200
          ${error ? 'border-status-error focus:ring-status-error/50' : 'border-gray-300'}
          disabled:bg-gray-50 disabled:text-gray-500
        `}
                {...props}
            />
            {error && (
                <span className="text-xs text-status-error">{error}</span>
            )}
        </div>
    );
};

export default Input;
