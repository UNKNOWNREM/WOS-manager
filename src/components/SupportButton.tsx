import React from 'react';
import { Coffee } from 'lucide-react';

interface SupportButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  variant = 'floating',
  className = ''
}) => {
  const baseStyles = "group flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95";

  const floatingStyles = "fixed bottom-6 right-6 z-[9999] bg-[#FFDD00] text-black shadow-lg hover:shadow-xl";

  const inlineStyles = "glass-panel text-white border-teal-600/30 hover:border-teal-600/60 hover:bg-teal-600/10";

  const buttonStyles = variant === 'floating'
    ? `${baseStyles} ${floatingStyles}`
    : `${baseStyles} ${inlineStyles}`;

  return (
    <a
      href="https://buymeacoffee.com/dong0108"
      target="_blank"
      rel="noopener noreferrer"
      className={`${buttonStyles} ${className}`}
    >
      <Coffee
        className={`w-5 h-5 transition-transform group-hover:rotate-12 ${
          variant === 'floating' ? 'text-black' : 'text-teal-400'
        }`}
      />
      <span className="text-sm font-semibold">
        Support me
      </span>
      <span className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </a>
  );
};

export default SupportButton;
