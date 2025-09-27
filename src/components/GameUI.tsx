'use client';

import { useState, useEffect } from 'react';

interface GameState {
  gameRunning: boolean;
  gamePaused: boolean;
  health: number;
  score: number;
  level: number;
  highScore: number;
}

interface GameUIProps {
  gameState: GameState;
  onPause: () => void;
  onRestart: () => void;
}

export default function GameUI({ gameState, onPause, onRestart }: GameUIProps) {
  const [healthPercentage, setHealthPercentage] = useState(100);
  const [scoreAnimation, setScoreAnimation] = useState(false);

  useEffect(() => {
    setHealthPercentage(gameState.health);
  }, [gameState.health]);

  useEffect(() => {
    if (gameState.score > 0) {
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 300);
    }
  }, [gameState.score]);

  const getHealthColor = (health: number) => {
    if (health > 70) return 'from-green-500 to-green-400';
    if (health > 40) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  const getHealthEmoji = (health: number) => {
    if (health > 80) return '💚';
    if (health > 60) return '💛';
    if (health > 40) return '🧡';
    if (health > 20) return '❤️';
    return '💔';
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Health Bar */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">Health</span>
            <span className="text-2xl">{getHealthEmoji(gameState.health)}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getHealthColor(gameState.health)} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${healthPercentage}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {gameState.health}%
              </span>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">Score</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className={`text-2xl font-bold text-yellow-400 transition-all duration-300 ${
            scoreAnimation ? 'scale-110 text-yellow-300' : 'scale-100'
          }`}>
            {gameState.score.toLocaleString()}
          </div>
        </div>

        {/* Level */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">Level</span>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {gameState.level}
          </div>
        </div>

        {/* High Score */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">High Score</span>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {gameState.highScore.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <button
          onClick={onPause}
          disabled={!gameState.gameRunning}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 btn-glow ${
            gameState.gamePaused
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
              : 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {gameState.gamePaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>

        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-lg font-bold text-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25 btn-glow"
        >
          🔄 Restart
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-300 text-sm space-y-1">
        <div className="flex flex-wrap justify-center gap-4">
          <span className="flex items-center gap-1">
            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-mono">←→↑↓</span>
            <span>Move</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-red-600 px-2 py-1 rounded text-xs font-mono">SPACE</span>
            <span>Shoot</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-purple-600 px-2 py-1 rounded text-xs font-mono">P</span>
            <span>Pause</span>
          </span>
        </div>
      </div>

      {/* Game Status Messages */}
      {!gameState.gameRunning && gameState.health <= 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-2xl p-8 text-center border border-red-500/50 shadow-2xl">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-4xl font-bold text-white mb-4">MISSION FAILED!</h2>
            <p className="text-xl text-red-200 mb-6">
              Your aircraft has been destroyed!
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-red-300 text-sm">Final Score</div>
                <div className={`text-2xl font-bold text-yellow-400 ${scoreAnimation ? 'score-pop' : ''}`}>
                  {gameState.score.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-red-300 text-sm">High Score</div>
                <div className="text-2xl font-bold text-orange-400">
                  {gameState.highScore.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="px-8 py-4 rounded-lg font-bold text-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
            >
              🚀 Start New Mission
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState.gamePaused && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 text-center border border-blue-500/50 shadow-2xl">
            <div className="text-6xl mb-4">⏸️</div>
            <h2 className="text-4xl font-bold text-white mb-4">Game Paused</h2>
            <p className="text-xl text-blue-200 mb-6">
              Take a break, warrior!
            </p>
            <button
              onClick={onPause}
              className="px-8 py-4 rounded-lg font-bold text-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
            >
              ▶️ Continue Mission
            </button>
          </div>
        </div>
      )}
    </>
  );
}