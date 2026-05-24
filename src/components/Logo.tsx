import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${sizes[size]} bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center shadow-glow-gold`}>
        <Wrench className="w-1/2 h-1/2 text-anthracite-950" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-gradient`}>
          P.A.R.C.E
        </span>
      )}
    </motion.div>
  );
}
