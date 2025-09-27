'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  id: string;
}

interface Aircraft extends GameObject {
  color: string;
}

interface Bullet extends GameObject {
  color: string;
}

interface Monster extends GameObject {
  color: string;
  type: 'basic' | 'fast' | 'heavy';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface GameState {
  gameRunning: boolean;
  gamePaused: boolean;
  health: number;
  score: number;
  level: number;
  highScore: number;
}

interface GameCanvasProps {
  aircraft: Aircraft;
  bullets: Bullet[];
  monsters: Monster[];
  particles: Particle[];
  gameState: GameState;
}

export default function GameCanvas({ aircraft, bullets, monsters, particles, gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Draw aircraft with advanced styling
  const drawAircraft = useCallback((ctx: CanvasRenderingContext2D, aircraft: Aircraft) => {
    // Main body with gradient
    const gradient = ctx.createLinearGradient(aircraft.x, aircraft.y, aircraft.x + aircraft.width, aircraft.y + aircraft.height);
    gradient.addColorStop(0, '#0066CC');
    gradient.addColorStop(0.3, '#0088FF');
    gradient.addColorStop(0.7, '#0066CC');
    gradient.addColorStop(1, '#004499');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(aircraft.x, aircraft.y, aircraft.width, aircraft.height);
    
    // Add glow effect
    ctx.shadowColor = '#0088FF';
    ctx.shadowBlur = 10;
    
    // Cockpit with golden shine
    const cockpitGradient = ctx.createRadialGradient(
      aircraft.x + aircraft.width / 2, 
      aircraft.y + aircraft.height / 3, 
      0, 
      aircraft.x + aircraft.width / 2, 
      aircraft.y + aircraft.height / 3, 
      15
    );
    cockpitGradient.addColorStop(0, '#FFD700');
    cockpitGradient.addColorStop(0.7, '#FFA500');
    cockpitGradient.addColorStop(1, '#FF8C00');
    
    ctx.fillStyle = cockpitGradient;
    ctx.fillRect(aircraft.x + 15, aircraft.y + 10, 20, 15);
    
    // Wings with 3D effect
    const wingGradient = ctx.createLinearGradient(aircraft.x - 5, aircraft.y + 20, aircraft.x + 5, aircraft.y + 40);
    wingGradient.addColorStop(0, '#002266');
    wingGradient.addColorStop(1, '#004499');
    
    ctx.fillStyle = wingGradient;
    ctx.fillRect(aircraft.x - 5, aircraft.y + 20, 12, 20);
    ctx.fillRect(aircraft.x + aircraft.width - 7, aircraft.y + 20, 12, 20);
    
    // Wing tips with glow
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(aircraft.x - 3, aircraft.y + 25, 6, 10);
    ctx.fillRect(aircraft.x + aircraft.width - 3, aircraft.y + 25, 6, 10);
    
    // Engine details
    ctx.fillStyle = '#333';
    ctx.fillRect(aircraft.x + 5, aircraft.y + 35, 8, 15);
    ctx.fillRect(aircraft.x + aircraft.width - 13, aircraft.y + 35, 8, 15);
    
    // Propeller with rotation effect
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(aircraft.x + aircraft.width / 2, aircraft.y + 5, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Propeller blades
    const time = Date.now() * 0.01;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = (time + i * Math.PI * 2 / 3) % (Math.PI * 2);
      const startX = aircraft.x + aircraft.width / 2;
      const startY = aircraft.y + 5;
      const endX = startX + Math.cos(angle) * 6;
      const endY = startY + Math.sin(angle) * 6;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
  }, []);

  // Draw bullets with fire effect
  const drawBullets = useCallback((ctx: CanvasRenderingContext2D, bullets: Bullet[]) => {
    bullets.forEach(bullet => {
      // Create fire gradient
      const fireGradient = ctx.createLinearGradient(bullet.x, bullet.y + bullet.height, bullet.x, bullet.y);
      fireGradient.addColorStop(0, '#FF0000');
      fireGradient.addColorStop(0.2, '#FF4400');
      fireGradient.addColorStop(0.4, '#FF6600');
      fireGradient.addColorStop(0.6, '#FF8800');
      fireGradient.addColorStop(0.8, '#FFAA00');
      fireGradient.addColorStop(1, '#FFFF00');
      
      ctx.fillStyle = fireGradient;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      
      // Add sparkle effect
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(bullet.x + 1, bullet.y + 2, 2, 2);
      
      // Add glow
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 5;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });
  }, []);

  // Draw monsters with different types
  const drawMonsters = useCallback((ctx: CanvasRenderingContext2D, monsters: Monster[]) => {
    monsters.forEach(monster => {
      // Main body with gradient based on type
      const monsterGradient = ctx.createLinearGradient(monster.x, monster.y, monster.x + monster.width, monster.y + monster.height);
      
      if (monster.type === 'fast') {
        monsterGradient.addColorStop(0, '#FF4444');
        monsterGradient.addColorStop(0.5, '#FF6666');
        monsterGradient.addColorStop(1, '#FF0000');
      } else if (monster.type === 'heavy') {
        monsterGradient.addColorStop(0, '#660000');
        monsterGradient.addColorStop(0.5, '#880000');
        monsterGradient.addColorStop(1, '#AA0000');
      } else {
        monsterGradient.addColorStop(0, '#8B0000');
        monsterGradient.addColorStop(0.5, '#A52A2A');
        monsterGradient.addColorStop(1, '#DC143C');
      }
      
      ctx.fillStyle = monsterGradient;
      ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
      
      // Outer border for 3D effect
      ctx.strokeStyle = '#440000';
      ctx.lineWidth = 2;
      ctx.strokeRect(monster.x, monster.y, monster.width, monster.height);
      
      // Glowing red eyes
      const eyeGradient = ctx.createRadialGradient(monster.x + 12, monster.y + 12, 0, monster.x + 12, monster.y + 12, 8);
      eyeGradient.addColorStop(0, '#FF0000');
      eyeGradient.addColorStop(0.7, '#CC0000');
      eyeGradient.addColorStop(1, '#990000');
      
      ctx.fillStyle = eyeGradient;
      ctx.fillRect(monster.x + 8, monster.y + 8, 8, 8);
      ctx.fillRect(monster.x + 24, monster.y + 8, 8, 8);
      
      // Eye pupils
      ctx.fillStyle = '#000000';
      ctx.fillRect(monster.x + 10, monster.y + 10, 4, 4);
      ctx.fillRect(monster.x + 26, monster.y + 10, 4, 4);
      
      // Sharp teeth
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(monster.x + 8 + i * 8, monster.y + 30, 4, 8);
      }
      
      // Wings (bat-like)
      ctx.fillStyle = '#4B0000';
      ctx.fillRect(monster.x - 8, monster.y + 15, 12, 15);
      ctx.fillRect(monster.x + monster.width - 4, monster.y + 15, 12, 15);
      
      // Wing details
      ctx.strokeStyle = '#660000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(monster.x - 8, monster.y + 20);
      ctx.lineTo(monster.x - 2, monster.y + 22);
      ctx.moveTo(monster.x + monster.width + 4, monster.y + 20);
      ctx.lineTo(monster.x + monster.width - 2, monster.y + 22);
      ctx.stroke();
      
      // Add type indicator
      if (monster.type === 'fast') {
        ctx.fillStyle = '#FFAA00';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('FAST', monster.x + 5, monster.y - 5);
      } else if (monster.type === 'heavy') {
        ctx.fillStyle = '#FFAA00';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('HEAVY', monster.x + 2, monster.y - 5);
      }
    });
  }, []);

  // Draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      
      // Create particle gradient
      const particleGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
      particleGradient.addColorStop(0, particle.color);
      particleGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
    });
  }, []);

  // Draw background with stars
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    // Space gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#000011');
    bgGradient.addColorStop(0.3, '#000033');
    bgGradient.addColorStop(0.7, '#000055');
    bgGradient.addColorStop(1, '#000077');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Animated stars
    const time = Date.now() * 0.001;
    for (let i = 0; i < 100; i++) {
      const x = (i * 37.5) % CANVAS_WIDTH;
      const y = (i * 23.7) % CANVAS_HEIGHT;
      const twinkle = Math.sin(time + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }, []);

  // Draw pause overlay
  const drawPauseOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Press P or click Pause to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }, []);

  // Draw game over overlay
  const drawGameOverOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText(`High Score: ${gameState.highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.fillText('Click Restart to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }, [gameState.score, gameState.highScore]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background
    drawBackground(ctx);
    
    // Draw game objects
    drawAircraft(ctx, aircraft);
    drawBullets(ctx, bullets);
    drawMonsters(ctx, monsters);
    drawParticles(ctx, particles);
    
    // Draw overlays
    if (gameState.gamePaused) {
      drawPauseOverlay(ctx);
    }
    
    if (!gameState.gameRunning && gameState.health <= 0) {
      drawGameOverOverlay(ctx);
    }
  }, [aircraft, bullets, monsters, particles, gameState, drawBackground, drawAircraft, drawBullets, drawMonsters, drawParticles, drawPauseOverlay, drawGameOverOverlay]);

  // Render on every frame
  useEffect(() => {
    const animate = () => {
      render();
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [render]);

  return (
    <div className="relative particle-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game-canvas w-full max-w-2xl mx-auto block"
      />
    </div>
  );
}
