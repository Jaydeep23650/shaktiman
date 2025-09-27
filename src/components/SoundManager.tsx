'use client';

import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SoundManagerProps {
  // No props needed for this component
}

export default function SoundManager({}: SoundManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<{[key: string]: AudioBuffer}>({});

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        await loadSounds();
      } catch {
        console.log('Audio not supported or user interaction required');
      }
    };

    // Load sound buffers
    const loadSounds = async () => {
      if (!audioContextRef.current) return;

      // Create procedural sound effects
      soundsRef.current = {
        shoot: createShootSound(),
        explosion: createExplosionSound(),
        hit: createHitSound(),
        powerup: createPowerupSound(),
        background: createBackgroundSound()
      };
    };

    // Create shoot sound
    const createShootSound = (): AudioBuffer => {
      if (!audioContextRef.current) return {} as AudioBuffer;
      
      const sampleRate = audioContextRef.current.sampleRate;
      const duration = 0.1;
      const buffer = audioContextRef.current.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // High frequency chirp
        data[i] = Math.sin(2 * Math.PI * (800 + t * 400) * t) * Math.exp(-t * 10) * 0.3;
      }

      return buffer;
    };

    // Create explosion sound
    const createExplosionSound = (): AudioBuffer => {
      if (!audioContextRef.current) return {} as AudioBuffer;
      
      const sampleRate = audioContextRef.current.sampleRate;
      const duration = 0.5;
      const buffer = audioContextRef.current.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Low frequency rumble with high frequency crack
        const rumble = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 3) * 0.5;
        const crack = Math.sin(2 * Math.PI * (200 + t * 1000) * t) * Math.exp(-t * 8) * 0.3;
        data[i] = rumble + crack;
      }

      return buffer;
    };

    // Create hit sound
    const createHitSound = (): AudioBuffer => {
      if (!audioContextRef.current) return {} as AudioBuffer;
      
      const sampleRate = audioContextRef.current.sampleRate;
      const duration = 0.2;
      const buffer = audioContextRef.current.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Sharp impact sound
        data[i] = Math.sin(2 * Math.PI * 300 * t) * Math.exp(-t * 15) * 0.4;
      }

      return buffer;
    };

    // Create powerup sound
    const createPowerupSound = (): AudioBuffer => {
      if (!audioContextRef.current) return {} as AudioBuffer;
      
      const sampleRate = audioContextRef.current.sampleRate;
      const duration = 0.3;
      const buffer = audioContextRef.current.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Rising tone
        data[i] = Math.sin(2 * Math.PI * (200 + t * 400) * t) * Math.exp(-t * 2) * 0.3;
      }

      return buffer;
    };

    // Create background ambient sound
    const createBackgroundSound = (): AudioBuffer => {
      if (!audioContextRef.current) return {} as AudioBuffer;
      
      const sampleRate = audioContextRef.current.sampleRate;
      const duration = 2;
      const buffer = audioContextRef.current.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Low ambient drone
        data[i] = Math.sin(2 * Math.PI * 50 * t) * 0.1 + 
                  Math.sin(2 * Math.PI * 75 * t) * 0.05;
      }

      return buffer;
    };

    // Play sound effect
    const playSound = (soundName: string) => {
      if (!audioContextRef.current || !soundsRef.current[soundName]) return;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = soundsRef.current[soundName];
      
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0.3; // Volume control
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.start();
    };

    // Initialize audio on user interaction
    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Global sound playing function
  useEffect(() => {
    (window as unknown as { playGameSound?: (type: 'shoot' | 'explosion' | 'hit' | 'powerup') => void }).playGameSound = (soundType: 'shoot' | 'explosion' | 'hit' | 'powerup') => {
      if (!audioContextRef.current || !soundsRef.current[soundType]) return;

      try {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = soundsRef.current[soundType];
        
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.3;
        
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        source.start();
      } catch {
        console.log('Sound playback error');
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}

// Hook for using sounds in other components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useGameSounds = () => {
  const playSound = (soundType: 'shoot' | 'explosion' | 'hit' | 'powerup') => {
    const windowWithSound = window as unknown as { playGameSound?: (type: 'shoot' | 'explosion' | 'hit' | 'powerup') => void };
    if (windowWithSound.playGameSound) {
      windowWithSound.playGameSound(soundType);
    }
  };

  return { playSound };
};
