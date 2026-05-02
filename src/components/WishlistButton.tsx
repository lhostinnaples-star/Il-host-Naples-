import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useWishlist } from '../contexts/WishlistContext';

interface WishlistButtonProps {
  propertyId: string;
  className?: string;
  iconClassName?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  propertyId, 
  className = "p-2 rounded-full backdrop-blur-md transition-all",
  iconClassName = "h-5 w-5"
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const active = isInWishlist(propertyId);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(propertyId);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`group ${className} ${active ? 'bg-white' : 'bg-white/20 hover:bg-white'} border border-white/20 hover:border-transparent z-10 relative`}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
      >
        <Heart 
          className={`${iconClassName} transition-colors ${
            active ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-500'
          }`} 
        />
      </motion.div>
    </button>
  );
};
