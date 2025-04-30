'use client';
import React, { useState, useEffect } from 'react';

// Define the structure of the props
export interface GameDataProps {
  telegramId: string; // Assuming telegramId is passed as a prop
  totalMoves: number;
}

const GameData: React.FC<GameDataProps> = ({ telegramId, totalMoves }) => {
  // States to hold score, currentMoves, and any error message
  const [score, setScore] = useState<number>(0);
  const [currentMoves, setCurrentMoves] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch score and current moves from the database when the component mounts
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/game?telegramId=${telegramId}`);
        const data = await response.json();

        if (data.success) {
          setScore(data.data.score);
          setCurrentMoves(data.data.moves);
        } else {
          setError(data.error || 'Unknown error');
        }
      } catch (err) {
        setError('Failed to fetch game data');
        console.error('Error fetching game data:', err);
      }
    };

    fetchGameData();
  }, [telegramId]);

  // Function to update score and moves in the database after any change
  const updateGameData = React.useCallback(async (newScore: number, newMoves: number) => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          score: newScore,
          moves: newMoves,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setScore(newScore);
        setCurrentMoves(newMoves);
      } else {
        setError(data.error || 'Failed to update game data');
      }
    } catch (err) {
      setError('Failed to update game data');
      console.error('Error updating game data:', err);
    }
  }, [telegramId]);

  // Function to periodically update game data every 5 seconds
  useEffect(() => {
    if (currentMoves === 0) return; // Stop if game is over
    const interval = setInterval(() => {
      if (score !== 0 && currentMoves !== totalMoves) {
        updateGameData(score, currentMoves); // Update periodically
      }
    }, 5000); // Update every 5 seconds (adjust as needed)

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [score, currentMoves, totalMoves, updateGameData]); // Re-run when score, currentMoves, or updateGameData change

  // Display error message if an error occurs
  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-3 mb-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-500/30 blur-3xl animate-pulse"></div>
        <div className="relative flex justify-between items-center bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-purple-300 border-opacity-50 transition-transform duration-300 hover:scale-105 hover:shadow-glow">
          <div className="absolute -top-4 -left-4 text-3xl animate-bounce">🎮</div>
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce delay-100">🌟</div>
          <div className="text-center z-10">
            <div className="text-sm text-purple-100 font-semibold mb-1">SCORE</div>
            <div
              className={`text-3xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent 
                ${score !== 0 ? 'animate-pulse' : ''}`}
            >
              {score.toLocaleString()}
            </div>
          </div>
          <div className="h-8 w-1 bg-white/30 mx-4 rounded-full"></div>
          <div className="text-center z-10">
            <div className="text-sm text-purple-100 font-semibold mb-1">MOVES LEFT</div>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                {currentMoves}
              </span>
              <span className="text-white/70">/ {totalMoves}</span>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-yellow-300 text-xl animate-star">⭐</div>
            ))}
          </div>
        </div>
      </div>
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
};

export default GameData;
