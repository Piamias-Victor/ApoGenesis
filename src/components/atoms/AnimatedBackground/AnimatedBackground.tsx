'use client';

import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0">
      
      {/* Blob 1 - Coin haut gauche */}
      <motion.div
        className="absolute w-80 h-72 bg-gradient-to-br from-blue-400/70 via-cyan-300/50 to-sky-200/40 filter blur-xl"
        style={{ 
          left: '-10%', 
          top: '-5%',
          borderRadius: '65% 35% 25% 75% / 55% 25% 75% 45%',
          transform: 'rotate(18deg)'
        }}
        animate={{
          x: [0, 80, -60, 45, 0],
          y: [0, -70, 85, -50, 0],
          scale: [1, 1.3, 0.7, 1.2, 1],
          rotate: [18, 80, -35, 60, 18],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 2 - Coin haut droit */}
      <motion.div
        className="absolute w-68 h-84 bg-gradient-to-tl from-pink-400/70 via-fuchsia-300/50 to-rose-200/40 filter blur-xl"
        style={{ 
          right: '-8%', 
          top: '-10%',
          borderRadius: '35% 65% 75% 25% / 45% 65% 35% 75%',
          transform: 'rotate(-25deg)'
        }}
        animate={{
          x: [0, -75, 65, -40, 0],
          y: [0, 60, -90, 55, 0],
          scale: [1, 0.6, 1.4, 0.8, 1],
          rotate: [-25, 35, -80, 20, -25],
        }}
        transition={{
          duration: 18,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 3 - Centre gauche */}
      <motion.div
        className="absolute w-92 h-80 bg-gradient-to-bl from-purple-400/70 via-indigo-300/50 to-violet-200/40 filter blur-xl"
        style={{ 
          left: '-15%', 
          top: '40%',
          borderRadius: '45% 55% 85% 15% / 65% 35% 65% 35%',
          transform: 'rotate(12deg)'
        }}
        animate={{
          x: [0, 95, -75, 60, 0],
          y: [0, -65, 80, -85, 0],
          scale: [1, 1.25, 0.75, 1.35, 1],
          rotate: [12, -45, 75, -20, 12],
        }}
        transition={{
          duration: 20,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 4 - Centre droit */}
      <motion.div
        className="absolute w-64 h-76 bg-gradient-to-tr from-emerald-400/70 via-teal-300/50 to-green-200/40 filter blur-xl"
        style={{ 
          right: '-12%', 
          top: '35%',
          borderRadius: '75% 25% 35% 65% / 25% 75% 65% 35%',
          transform: 'rotate(-18deg)'
        }}
        animate={{
          x: [0, -85, 70, -55, 0],
          y: [0, 75, -65, 40, 0],
          scale: [1, 0.65, 1.45, 0.85, 1],
          rotate: [-18, 55, -70, 45, -18],
        }}
        transition={{
          duration: 22,
          delay: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 5 - Coin bas gauche */}
      <motion.div
        className="absolute w-76 h-68 bg-gradient-to-bl from-orange-400/70 via-amber-300/50 to-yellow-200/40 filter blur-xl"
        style={{ 
          left: '-8%', 
          bottom: '-10%',
          borderRadius: '25% 75% 65% 35% / 75% 25% 35% 65%',
          transform: 'rotate(28deg)'
        }}
        animate={{
          x: [0, 90, -65, 70, 0],
          y: [0, -80, 70, -45, 0],
          scale: [1, 1.4, 0.8, 1.15, 1],
          rotate: [28, -25, 85, 35, 28],
        }}
        transition={{
          duration: 16,
          delay: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 6 - Coin bas droit */}
      <motion.div
        className="absolute w-72 h-60 bg-gradient-to-tl from-red-400/70 via-pink-300/50 to-rose-200/40 filter blur-xl"
        style={{ 
          right: '-5%', 
          bottom: '-8%',
          borderRadius: '40% 60% 20% 80% / 60% 40% 80% 20%',
          transform: 'rotate(38deg)'
        }}
        animate={{
          x: [0, -70, 85, -50, 0],
          y: [0, -55, 65, -75, 0],
          scale: [1, 0.7, 1.5, 0.9, 1],
          rotate: [38, 15, -60, 90, 38],
        }}
        transition={{
          duration: 19,
          delay: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 7 - Centre haut */}
      <motion.div
        className="absolute w-56 h-64 bg-gradient-to-br from-yellow-400/70 via-lime-300/50 to-green-200/40 filter blur-xl"
        style={{ 
          left: '40%', 
          top: '-12%',
          borderRadius: '80% 20% 40% 60% / 30% 70% 20% 80%',
          transform: 'rotate(-8deg)'
        }}
        animate={{
          x: [0, -55, 75, -65, 0],
          y: [0, 90, -70, 50, 0],
          scale: [1, 1.6, 0.6, 1.3, 1],
          rotate: [-8, 65, -55, 40, -8],
        }}
        transition={{
          duration: 21,
          delay: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 8 - Centre bas */}
      <motion.div
        className="absolute w-48 h-72 bg-gradient-to-bl from-slate-400/70 via-blue-300/50 to-gray-200/40 filter blur-xl"
        style={{ 
          left: '45%', 
          bottom: '-15%',
          borderRadius: '60% 40% 80% 20% / 40% 60% 20% 80%',
          transform: 'rotate(-35deg)'
        }}
        animate={{
          x: [0, -80, 60, -45, 0],
          y: [0, 70, -85, 95, 0],
          scale: [1, 1.2, 0.75, 1.4, 1],
          rotate: [-35, 25, -95, 15, -35],
        }}
        transition={{
          duration: 17,
          delay: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 9 - Centre droit (NOUVEAU) */}
      <motion.div
        className="absolute w-64 h-56 bg-gradient-to-tr from-violet-400/70 via-purple-300/50 to-indigo-200/40 filter blur-xl"
        style={{ 
          right: '15%', 
          top: '50%',
          borderRadius: '55% 45% 70% 30% / 35% 65% 45% 55%',
          transform: 'rotate(45deg)'
        }}
        animate={{
          x: [0, -45, 65, -35, 0],
          y: [0, -60, 40, -75, 0],
          scale: [1, 1.35, 0.8, 1.1, 1],
          rotate: [45, -15, 85, 25, 45],
        }}
        transition={{
          duration: 23,
          delay: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
    </div>
  );
};