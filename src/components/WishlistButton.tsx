import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

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
  const isSaved = () => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved).includes(propertyId) : false;
  };

  const [active, setActive] = useState(isSaved());

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = localStorage.getItem('wishlist');
    let list = saved ? JSON.parse(saved) : [];
    
    if (active) {
      list = list.filter((id: string) => id !== propertyId);
    } else {
      list.push(propertyId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(list));
    setActive(!active);
  };

  return (
    <button 
      onClick={toggleWishlist}
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
