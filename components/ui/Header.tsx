'use client';
import { WebApp } from "@twa-dev/types";
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

interface TelegramUser {
  id: number
  firstName?: string
  lastName?: string
  username?: string
}

interface HeaderProps {
  score: number
}

export default function Header({ score }: HeaderProps): React.JSX.Element {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const points = Math.floor(score / 10000)  // Points are calculated as score divided by 10,000

  useEffect(() => {
    const controller = new AbortController()

    const initializeApp = async () => {
      try {
        if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
          setError('This app must be opened within Telegram')
          return
        }

        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        if (!tg.initDataUnsafe?.user) {
          setError('Missing user authentication data')
          return
        }

        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: tg.initData,
            user: tg.initDataUnsafe.user
          }),
          signal: controller.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const userData = await response.json()
        setUser(userData)

        // After setting user, call API to update their points
        await fetch('/api/updatePoints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id }),
        });

      } catch (err) {
        console.error('User initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      }
    }

    initializeApp()

    return () => controller.abort()
  }, [])

  if (error) {
    return (
      <div className="container my-auto p-4 text-red-500">
        ⚠️ {error}
        <div aria-live="polite" className="sr-only">Error: {error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300/80 h-12 w-12" />
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300/80 rounded w-3/4" />
            <div className="h-4 bg-gray-300/80 rounded w-1/2" />
          </div>
        </div>
        <div aria-live="polite" className="sr-only">Loading user data</div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch mt-4 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl px-4 py-3 flex items-center flex-1 min-w-0 group relative overflow-hidden">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl animate-bounce">⚡</span>
            <div className="flex flex-col min-w-0">
              <span 
                className="font-bold text-white text-sm md:text-base truncate"
                title={user.firstName || 'Anonymous'}
              >
                {user.firstName}
              </span>
              <span className="font-bold text-yellow-300 text-sm md:text-base flex items-center truncate">
                <span className="mr-1">🪙</span>
                {points}  {/* This is the points instead of balance */}
                <span className="ml-1 text-purple-200">FLX</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 3s linear infinite; }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>

      <div aria-live="polite" className="sr-only">
        User profile loaded: {user.firstName} - Points: {points} FLX
      </div>
    </div>
  )
}
