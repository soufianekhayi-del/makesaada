import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative font-medium rounded-xl py-4 px-6 text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation";
  
  const variants = {
    primary: "bg-morocco-green text-white shadow-lg shadow-morocco-green/20 hover:bg-morocco-greenLight",
    secondary: "bg-morocco-terracotta text-white shadow-md shadow-morocco-terracotta/20 hover:bg-morocco-terracottaDark",
    outline: "border-2 border-morocco-green text-morocco-green bg-transparent hover:bg-morocco-green/5",
    ghost: "bg-transparent text-morocco-charcoal hover:bg-morocco-sandDark",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${loading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};