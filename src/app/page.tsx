'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from '@/components/GameCanvas';
import GameUI from '@/components/GameUI';
// import ParticleSystem from '@/components/ParticleSystem';
import SoundManager from '@/components/SoundManager';

interface GameState {
  gameRunning: boolean;
  gamePaused: boolean;
  health: number;
  score: number;
  level: number;
  highScore: number;
}

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

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    gameRunning: true,
    gamePaused: false,
    health: 100,
    score: 0,
    level: 1,
    highScore: 0
  });

  // Load high score from localStorage after component mounts
  useEffect(() => {
    const savedHighScore = localStorage.getItem('shaktimanHighScore');
    if (savedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  const [aircraft, setAircraft] = useState<Aircraft>({
    x: 350,
    y: 500,
    width: 50,
    height: 60,
    speed: 6,
    color: '#0066CC',
    id: 'aircraft'
  });

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const monsterSpawnTimerRef = useRef<number>(0);
  const keysRef = useRef<{[key: string]: boolean}>({});

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Sound effects
  const playSound = useCallback((soundType: 'shoot' | 'explosion' | 'hit' | 'powerup') => {
    if ((window as unknown as { playGameSound?: (type: 'shoot' | 'explosion' | 'hit' | 'powerup') => void }).playGameSound) {
      (window as unknown as { playGameSound: (type: 'shoot' | 'explosion' | 'hit' | 'powerup') => void }).playGameSound(soundType);
    }
  }, []);

  // Add particles for visual effects
  const addParticles = useCallback((x: number, y: number, type: 'explosion' | 'trail') => {
    const newParticles: Particle[] = [];
    const count = type === 'explosion' ? 15 : 5;
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color: type === 'explosion' ? 
          ['#FF0000', '#FF6600', '#FFAA00', '#FFFF00'][Math.floor(Math.random() * 4)] :
          '#0088FF',
        size: Math.random() * 3 + 1
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98
      })).filter(particle => particle.life > 0)
    );
  }, []);

  // Shoot bullet
  const shootBullet = useCallback(() => {
    const newBullet: Bullet = {
      x: aircraft.x + aircraft.width / 2 - 2,
      y: aircraft.y,
      width: 4,
      height: 12,
      speed: 8,
      color: '#FF0000',
      id: `bullet-${Date.now()}-${Math.random()}`
    };
    
    setBullets(prev => [...prev, newBullet]);
    playSound('shoot');
    addParticles(aircraft.x + aircraft.width / 2, aircraft.y, 'trail');
  }, [aircraft, playSound, addParticles]);

  // Spawn monster
  const spawnMonster = useCallback(() => {
    const monsterTypes: ('basic' | 'fast' | 'heavy')[] = ['basic', 'fast', 'heavy'];
    const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    const speeds = { basic: 2, fast: 4, heavy: 1 };
    const colors = { basic: '#8B0000', fast: '#FF4444', heavy: '#660000' };
    
    const newMonster: Monster = {
      x: Math.random() * (CANVAS_WIDTH - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: speeds[type] + Math.random() * 1,
      color: colors[type],
      type,
      id: `monster-${Date.now()}-${Math.random()}`
    };
    
    setMonsters(prev => [...prev, newMonster]);
  }, []);

  // Update aircraft position
  const updateAircraft = useCallback(() => {
    setAircraft(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      if (keysRef.current['ArrowLeft'] && prev.x > 0) {
        newX = Math.max(0, prev.x - prev.speed);
      }
      if (keysRef.current['ArrowRight'] && prev.x < CANVAS_WIDTH - prev.width) {
        newX = Math.min(CANVAS_WIDTH - prev.width, prev.x + prev.speed);
      }
      if (keysRef.current['ArrowUp'] && prev.y > 0) {
        newY = Math.max(0, prev.y - prev.speed);
      }
      if (keysRef.current['ArrowDown'] && prev.y < CANVAS_HEIGHT - prev.height) {
        newY = Math.min(CANVAS_HEIGHT - prev.height, prev.y + prev.speed);
      }
      
      return { ...prev, x: newX, y: newY };
    });
  }, []);

  // Update bullets
  const updateBullets = useCallback(() => {
    setBullets(prev => prev.map(bullet => ({
      ...bullet,
      y: bullet.y - bullet.speed
    })).filter(bullet => bullet.y > -bullet.height));
  }, []);

  // Update monsters
  const updateMonsters = useCallback(() => {
    setMonsters(prev => prev.map(monster => ({
      ...monster,
      y: monster.y + monster.speed
    })).filter(monster => monster.y < CANVAS_HEIGHT + monster.height));
  }, []);

  // Check collisions
  const checkCollisions = useCallback(() => {
    setBullets(prevBullets => {
      const newBullets = [...prevBullets];
      
      setMonsters(prevMonsters => {
        const newMonsters = [...prevMonsters];
        
        // Bullet vs Monster collisions
        for (let i = newBullets.length - 1; i >= 0; i--) {
          for (let j = newMonsters.length - 1; j >= 0; j--) {
            const bullet = newBullets[i];
            const monster = newMonsters[j];
            
            if (bullet.x < monster.x + monster.width &&
                bullet.x + bullet.width > monster.x &&
                bullet.y < monster.y + monster.height &&
                bullet.y + bullet.height > monster.y) {
              
              // Remove bullet and monster
              newBullets.splice(i, 1);
              newMonsters.splice(j, 1);
              
              // Add explosion particles
              addParticles(monster.x + monster.width / 2, monster.y + monster.height / 2, 'explosion');
              playSound('explosion');
              
              // Update score based on monster type
              const scoreBonus = monster.type === 'fast' ? 20 : monster.type === 'heavy' ? 30 : 10;
              setGameState(prev => {
                const newScore = prev.score + scoreBonus;
                const newHighScore = Math.max(prev.highScore, newScore);
                if (newHighScore > prev.highScore) {
                  if (typeof window !== 'undefined') {
                  localStorage.setItem('shaktimanHighScore', newHighScore.toString());
                }
                }
                return {
                  ...prev,
                  score: newScore,
                  highScore: newHighScore
                };
              });
              
              break;
            }
          }
        }
        
        return newMonsters;
      });
      
      return newBullets;
    });

    // Aircraft vs Monster collisions
    setMonsters(prevMonsters => {
      const newMonsters = [...prevMonsters];
      
      for (let i = newMonsters.length - 1; i >= 0; i--) {
        const monster = newMonsters[i];
        
        if (aircraft.x < monster.x + monster.width &&
            aircraft.x + aircraft.width > monster.x &&
            aircraft.y < monster.y + monster.height &&
            aircraft.y + aircraft.height > monster.y) {
          
          // Remove monster and reduce health
          newMonsters.splice(i, 1);
          addParticles(monster.x + monster.width / 2, monster.y + monster.height / 2, 'explosion');
          playSound('hit');
          
          setGameState(prev => {
            const newHealth = Math.max(0, prev.health - 15);
            if (newHealth <= 0) {
              return { ...prev, health: 0, gameRunning: false };
            }
            return { ...prev, health: newHealth };
          });
        }
      }
      
      return newMonsters;
    });
  }, [aircraft, addParticles, playSound]);

  // Pause/Resume toggle
  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, gamePaused: !prev.gamePaused }));
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key] = true;
    
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!gameState.gamePaused) {
        shootBullet();
      }
    }
    
    if (e.key.toLowerCase() === 'p') {
      e.preventDefault();
      togglePause();
    }
  }, [gameState.gamePaused, shootBullet, togglePause]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key] = false;
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    setGameState({
      gameRunning: true,
      gamePaused: false,
      health: 100,
      score: 0,
      level: 1,
      highScore: typeof window !== 'undefined' ? parseInt(localStorage.getItem('shaktimanHighScore') || '0') : 0
    });
    
    setAircraft({
      x: 350,
      y: 500,
      width: 50,
      height: 60,
      speed: 6,
      color: '#0066CC',
      id: 'aircraft'
    });
    
    setBullets([]);
    setMonsters([]);
    setParticles([]);
    keysRef.current = {};
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.gameRunning) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    if (!gameState.gamePaused) {
      updateAircraft();
      updateBullets();
      updateMonsters();
      updateParticles();
      checkCollisions();
      
      // Spawn monsters
      monsterSpawnTimerRef.current += deltaTime;
      if (monsterSpawnTimerRef.current > 1500) {
        spawnMonster();
        monsterSpawnTimerRef.current = 0;
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameRunning, gameState.gamePaused, updateAircraft, updateBullets, updateMonsters, updateParticles, checkCollisions, spawnMonster]);

  // Initialize game
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, gameLoop]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            🚀 SHAKTIMAN AIR FIGHT 🚀
          </h1>
          <p className="text-gray-300 text-sm">
            Defend the skies with your powerful aircraft!
          </p>
        </div>
        
        <GameUI 
          gameState={gameState}
          onPause={togglePause}
          onRestart={restartGame}
        />
        
        <GameCanvas
          aircraft={aircraft}
          bullets={bullets}
          monsters={monsters}
          particles={particles}
          gameState={gameState}
        />
        
        <SoundManager />
      </div>
    </main>
  );
}