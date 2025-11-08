'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

interface Astrologer {
  id: string
  name: string
  image: string
  specialization: string
  rating: number
  experience: string
  languages: string[]
  pricePerMin: number
}

const astrologers: Astrologer[] = [
  {
    id: '1',
    name: 'AnuNK',
    image: '👩‍🦱',
    specialization: 'Vedic, Numerology',
    rating: 4.9,
    experience: '12 years',
    languages: ['Hindi', 'English'],
    pricePerMin: 20,
  },
  {
    id: '2',
    name: 'Kimyanka',
    image: '👩',
    specialization: 'Tarot, Palmistry',
    rating: 4.8,
    experience: '8 years',
    languages: ['Hindi', 'English', 'Punjabi'],
    pricePerMin: 18,
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    image: '👨',
    specialization: 'KP System, Vedic',
    rating: 4.7,
    experience: '15 years',
    languages: ['Hindi', 'English'],
    pricePerMin: 25,
  },
]

export default function HomeScreen() {
  const { userProfile, walletBalance, freeChatClaimed, setCurrentScreen } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  const features = [
    { icon: '🌅', label: 'Daily\nHoroscope', color: 'from-amber-400 to-amber-500' },
    { icon: '📋', label: 'Free\nKundli', color: 'from-amber-400 to-amber-500' },
    { icon: '💍', label: 'Kundli\nMatching', color: 'from-amber-400 to-amber-500' },
    { icon: '📖', label: 'Astrology\nBlog', color: 'from-amber-400 to-amber-500' },
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
    // Future implementation
    console.log('Call feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl">
          {userProfile?.name?.charAt(0).toUpperCase() || '😊'}
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
          <span className="text-xl">💰</span>
          <span className="font-bold text-gray-800">₹ {walletBalance}</span>
          <button className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-sm font-bold">
            +
          </button>
        </div>

        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-4 py-3 pl-4 pr-12 bg-white border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
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
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg hover:scale-105 transition-transform`}>
                {feature.icon}
              </div>
              <span className="text-xs text-gray-700 text-center leading-tight whitespace-pre-line font-medium">
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
            <h2 className="text-4xl font-bold text-amber-400 mb-1">
              50% CASHBACK!
            </h2>
            <p className="text-white text-sm mb-4">on your next Recharge</p>
            <button className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-full hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg">
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

      {/* Live Astrologers */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Live Astrologers</h3>
          <button className="text-sm text-amber-600 font-semibold">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {astrologers.map((astrologer) => (
            <motion.button
              key={astrologer.id}
              whileHover={{ scale: 1.05 }}
              onClick={handleChatWithAstrologer}
              className="flex-shrink-0 w-48 bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-7xl">
                  {astrologer.image}
                </div>
                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <span className="text-amber-500">⭐</span>
                  <span>{astrologer.rating}</span>
                </div>
              </div>
              <div className="p-3 text-left">
                <h4 className="font-bold text-gray-800 text-sm">{astrologer.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{astrologer.specialization}</p>
                <p className="text-xs text-gray-500 mt-1">{astrologer.experience}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-amber-600 font-semibold">₹{astrologer.pricePerMin}/min</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Online</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* My Sessions */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">My Sessions</h3>
          <button className="text-sm text-amber-600 font-semibold">View All</button>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-sm">No sessions yet</p>
            <p className="text-xs mt-1">Start your first consultation below</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handleChatWithAstrologer}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-2xl font-bold text-gray-900 transition-all shadow-lg"
          >
            <span className="text-xl">💬</span>
            <span>Chat with Astrologer</span>
          </button>
          <button
            onClick={handleCallWithAstrologer}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-2xl font-bold text-gray-900 transition-all shadow-lg"
          >
            <span className="text-xl">📞</span>
            <span>Call with Astrologer</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-amber-600">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">💬</span>
            <span className="text-xs">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">📺</span>
            <span className="text-xs">Live</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">📞</span>
            <span className="text-xs">Call</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">🙏</span>
            <span className="text-xs">Remedies</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

