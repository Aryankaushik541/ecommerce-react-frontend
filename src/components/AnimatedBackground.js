import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setGradientPosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="animated-background">
      {/* Orb 1: Deep Gold */}
      <motion.div
        className="gradient-orb orb-1"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Orb 2: Bronze/Darker Tone */}
      <motion.div
        className="gradient-orb orb-2"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Orb 3: Faint Silver/Highlight */}
      <motion.div
        className="gradient-orb orb-3"
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Mouse Follower: Subtle Gold Glow */}
      <div
        className="mouse-gradient"
        style={{
          background: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(212, 175, 55, 0.15) 0%, transparent 40%)`
        }}
      />
      
      {/* Overlay Texture to add grain/noise for a premium paper feel */}
      <div className="noise-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;