'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'explosion' | 'trail' | 'sparkle' | 'smoke';
}

interface ParticleSystemProps {
  particles: Particle[];
}

export default function ParticleSystem({ particles }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderParticle = (particle: Particle) => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;

      switch (particle.type) {
        case 'explosion':
          // Fire explosion particles
          const explosionGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          );
          explosionGradient.addColorStop(0, particle.color);
          explosionGradient.addColorStop(0.5, '#FF6600');
          explosionGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = explosionGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'trail':
          // Bullet trail particles
          const trailGradient = ctx.createLinearGradient(
            particle.x - particle.size, particle.y,
            particle.x + particle.size, particle.y
          );
          trailGradient.addColorStop(0, 'transparent');
          trailGradient.addColorStop(0.5, particle.color);
          trailGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = trailGradient;
          ctx.fillRect(particle.x - particle.size, particle.y - particle.size/2, particle.size * 2, particle.size);
          break;

        case 'sparkle':
          // Sparkle effect
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add cross pattern for sparkle
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x - particle.size, particle.y);
          ctx.lineTo(particle.x + particle.size, particle.y);
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x, particle.y + particle.size);
          ctx.stroke();
          break;

        case 'smoke':
          // Smoke particles
          const smokeGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 1.5
          );
          smokeGradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
          smokeGradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.4)');
          smokeGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = smokeGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        renderParticle(particle);
      });
      
      requestAnimationFrame(animate);
    };

    animate();
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}

// Utility functions for creating different particle effects
export const createExplosionParticles = (x: number, y: number, count: number = 15): Particle[] => {
  const colors = ['#FF0000', '#FF6600', '#FFAA00', '#FFFF00'];
  
  return Array.from({ length: count }, () => ({
    x: x + (Math.random() - 0.5) * 30,
    y: y + (Math.random() - 0.5) * 30,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    life: 30 + Math.random() * 20,
    maxLife: 30 + Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 4 + 2,
    type: 'explosion' as const
  }));
};

export const createTrailParticles = (x: number, y: number, count: number = 5): Particle[] => {
  return Array.from({ length: count }, () => ({
    x: x + (Math.random() - 0.5) * 10,
    y: y + (Math.random() - 0.5) * 10,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 20,
    maxLife: 20,
    color: '#0088FF',
    size: Math.random() * 2 + 1,
    type: 'trail' as const
  }));
};

export const createSparkleParticles = (x: number, y: number, count: number = 8): Particle[] => {
  return Array.from({ length: count }, () => ({
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    life: 25,
    maxLife: 25,
    color: '#FFD700',
    size: Math.random() * 2 + 1,
    type: 'sparkle' as const
  }));
};

export const createSmokeParticles = (x: number, y: number, count: number = 10): Particle[] => {
  return Array.from({ length: count }, () => ({
    x: x + (Math.random() - 0.5) * 15,
    y: y + (Math.random() - 0.5) * 15,
    vx: (Math.random() - 0.5) * 1,
    vy: -Math.random() * 2 - 1,
    life: 40 + Math.random() * 20,
    maxLife: 40 + Math.random() * 20,
    color: '#666666',
    size: Math.random() * 3 + 2,
    type: 'smoke' as const
  }));
};
