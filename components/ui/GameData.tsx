'use client';

import { useState, useEffect } from "react";

interface GameDataProps {
  score: number;
  currentMoves: number;
  totalMoves: number;
  userId: string;
}

export default function GameData({
  score = 0,
  currentMoves = 0,
  totalMoves = 30,
  userId,
}: GameDataProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const updateGameState = async (type: 'score' | 'moves', value: number) => {
    try {
      const endpoint = `/api/game/update-${type}`;
      const body = {
        userId,
        [type === 'score' ? 'score' : 'currentMoves']: value
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to update ${type}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to update ${type}`;
      console.error(`${type} update error:`, err);
      setError(message);
    }
  };

  // Debounced score updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateGameState('score', score);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [score]);

  // Debounced moves updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateGameState('moves', currentMoves);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentMoves]);

  // Animation handling
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [score, currentMoves]);

  return (
    <div className="max-w-2xl mx-auto mt-3 mb-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-500/30 blur-3xl animate-pulse"></div>
        <div className="relative flex justify-between items-center bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-purple-300 border-opacity-50 transition-transform duration-300 hover:scale-105 hover:shadow-glow">
          <div className="absolute -top-4 -left-4 text-3xl animate-bounce">🎮</div>
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce delay-100">🌟</div>
          
          {/* Score Display */}
          <div className="text-center z-10">
            <div className="text-sm text-purple-100 font-semibold mb-1">SCORE</div>
            <div className={`text-3xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent 
              ${isAnimating ? 'animate-pulse' : ''}`}>
              {score.toLocaleString()}
            </div>
          </div>

          <div className="h-8 w-1 bg-white/30 mx-4 rounded-full"></div>

          {/* Moves Display */}
          <div className="text-center z-10">
            <div className="text-sm text-purple-100 font-semibold mb-1">MOVES LEFT</div>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <span className={`${isAnimating ? 'animate-wiggle' : ''}`}>🎯</span>
              <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                {currentMoves}
              </span>
              <span className="text-white/70">/ {totalMoves}</span>
            </div>
          </div>

          {/* Animated Stars */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-yellow-300 text-xl animate-star">⭐</div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-900 font-bold hover:text-red-700"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes star {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
        }
        .animate-pulse {
          animation: pulse 0.5s ease-in-out;
        }
        .animate-wiggle {
          animation: wiggle 0.6s ease-in-out;
        }
        .animate-star {
          animation: star 1s ease-out forwards;
        }
        .hover\:shadow-glow:hover {
          box-shadow: 0 0 40px rgba(168,85,247,0.3), 0 0 80px rgba(236,72,153,0.2);
        }
      `}</style>
    </div>
  );
}