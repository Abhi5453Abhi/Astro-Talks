'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import AuthButton from '@/components/AuthButton'

export default function HomeScreen() {
  const {
    userProfile,
    walletBalance,
    freeChatClaimed,
    currentScreen,
    setCurrentScreen,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  const isHomeContext =
    currentScreen === 'home' ||
    (currentScreen === 'free-chat-option' && freeChatClaimed)

  const features = [
    {
      icon: '🌅',
      label: 'Daily\nHoroscope',
      color: 'from-yellow-400 to-yellow-500',
      action: () => setCurrentScreen('daily-horoscope'),
    },
    { icon: '📋', label: 'Free\nKundli', color: 'from-yellow-400 to-yellow-500' },
    { icon: '💍', label: 'Kundli\nMatching', color: 'from-yellow-400 to-yellow-500' },
    { icon: '📖', label: 'Astrology\nBlog', color: 'from-yellow-400 to-yellow-500' },
  ]

  const handleChatWithAstrologer = () => {
    // If free chat already claimed, go directly to chat
    // Otherwise, show the free chat option first
    if (freeChatClaimed) {
      setCurrentScreen('chat')
    } else {
      setCurrentScreen('free-chat-option')
    }
  }

  const handleCallWithAstrologer = () => {
    console.log('Call feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 pb-40 relative overflow-hidden">
      {/* Star background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-lg border-b border-slate-700/50 relative z-10">
        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-2xl">
          {userProfile?.name?.charAt(0).toUpperCase() || '😊'}
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-full shadow-sm">
          <span className="text-xl">💰</span>
          <span className="font-bold text-white">₹ {walletBalance}</span>
          <button className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">
            +
          </button>
        </div>

        <div className="hidden sm:block">
          <AuthButton variant="ghost" />
        </div>
      </div>

      <div className="px-4 pt-3 sm:hidden relative z-10">
        <AuthButton variant="primary" />
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 relative z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-4 py-3 pl-4 pr-12 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 shadow-lg"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feature Buttons */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.action}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg hover:scale-105 transition-transform`}>
                {feature.icon}
              </div>
              <span className="text-xs text-white text-center leading-tight whitespace-pre-line font-medium">
                {feature.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cashback Banner */}
      <div className="px-4 py-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 shadow-xl"
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-yellow-400 mb-1">
              50% CASHBACK!
            </h2>
            <p className="text-white text-sm mb-4">on your next Recharge</p>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg">
              RECHARGE NOW
            </button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-90">
            💰
          </div>
          <div className="absolute right-12 top-6 text-4xl opacity-70">
            💵
          </div>
          <div className="absolute right-2 bottom-4 text-5xl opacity-60">
            💳
          </div>
        </motion.div>
      </div>

      {/* My Sessions */}
      <div className="px-4 py-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">My Sessions</h3>
          <button className="text-sm text-yellow-400 font-semibold hover:text-yellow-300">View All</button>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-slate-700/50">
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-sm text-gray-300">No sessions yet</p>
            <p className="text-xs mt-1 text-gray-400">Start your first consultation below</p>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {isHomeContext && (
        <>
          {/* Action Buttons */}
          <div className="pointer-events-none fixed bottom-16 left-0 right-0 px-4 py-4 bg-slate-900/70 backdrop-blur-lg border-t border-slate-700/40 z-30">
            <div className="pointer-events-auto mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleChatWithAstrologer}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-white text-slate-900 font-semibold tracking-wide py-3 px-4 shadow-[0_6px_18px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.3)] sm:px-6 sm:py-3.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-900">
                  💬
                </span>
                <span className="text-xs text-slate-900 whitespace-nowrap sm:text-sm">Chat with Astrologer</span>
              </button>
              <button
                onClick={handleCallWithAstrologer}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-white text-slate-900 font-semibold tracking-wide py-3 px-4 shadow-[0_6px_18px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.3)] sm:px-6 sm:py-3.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-900">
                  📞
                </span>
                <span className="text-xs text-slate-900 whitespace-nowrap sm:text-sm">Call with Astrologer</span>
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 shadow-lg z-20">
            <div className="flex items-center justify-around">
              <button className="flex flex-col items-center gap-1 text-yellow-400">
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-semibold">Home</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
                <span className="text-2xl">💬</span>
                <span className="text-xs">Chat</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
                <span className="text-2xl">📞</span>
                <span className="text-xs">Call</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
                <span className="text-2xl">🙏</span>
                <span className="text-xs">Remedies</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

