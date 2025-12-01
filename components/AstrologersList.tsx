'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import AstrologerCard from './AstrologerCard'

const categories = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'tarot', name: 'Tarot', icon: '🎴' },
  { id: 'palmistry', name: 'Palmistry', icon: '✋' },
  { id: 'vedic', name: 'Vedic', icon: '🕉️' },
  { id: 'numerology', name: 'Numerology', icon: '🔢' },
  { id: 'vastu', name: 'Vastu', icon: '🏠' },
]

interface AstrologersListProps {
  mode?: 'chat' | 'call'
}

export default function AstrologersList({ mode = 'chat' }: AstrologersListProps) {
  const { setCurrentScreen } = useStore()
  const [astrologersList, setAstrologersList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filterOnline, setFilterOnline] = useState(false)
  const [filterCelebrity, setFilterCelebrity] = useState(false)

  // Fetch astrologers list
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await fetch('/api/astrologers/list')
        const data = await response.json()
        if (data.success) {
          setAstrologersList(data.astrologers)
        }
      } catch (error) {
        console.error('Error fetching astrologers list:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAstrologers()
  }, [])

  // Filter astrologers
  const filteredAstrologers = astrologersList.filter((astrologer) => {
    const matchesSearch = astrologer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
      astrologer.specialties.some((s: string) => s.toLowerCase() === selectedCategory)
    const matchesOnline = !filterOnline || astrologer.is_online
    const matchesCelebrity = !filterCelebrity || astrologer.is_celebrity
    return matchesSearch && matchesCategory && matchesOnline && matchesCelebrity
  })

  const handleActionWithAstrologer = (astrologer: any) => {
    if (mode === 'call') {
      console.log('Call with:', astrologer.name)
      // TODO: Implement call functionality
    } else {
      console.log('Chat with:', astrologer.name)
      // TODO: Implement chat functionality
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Header - Similar to screenshot */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        {/* Back button removed as per screenshot */}
        
        {/* Category Filters */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-700 bg-slate-800 text-gray-300 font-semibold whitespace-nowrap transition-colors hover:border-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>

          {/* Category buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-yellow-400 text-slate-900 border-2 border-yellow-500'
                  : 'bg-slate-800 text-gray-300 border-2 border-slate-700 hover:border-slate-600'
              }`}
            >
              {category.id !== 'all' && <span className="text-lg">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>

        {/* Filter dropdown */}
        {showFilters && (
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={() => setFilterOnline(!filterOnline)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filterOnline
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-gray-300 border-2 border-slate-700'
              }`}
            >
              {filterOnline ? '✓ ' : ''}Online Only
            </button>
            <button
              onClick={() => setFilterCelebrity(!filterCelebrity)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filterCelebrity
                  ? 'bg-yellow-500 text-slate-900'
                  : 'bg-slate-800 text-gray-300 border-2 border-slate-700'
              }`}
            >
              {filterCelebrity ? '✓ ' : ''}★ Celebrity
            </button>
          </div>
        )}
      </div>

      {/* Astrologers List - Full width cards */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[140px] bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/50"></div>
            ))}
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">No astrologers found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAstrologers.map((astrologer) => (
              <AstrologerCard
                key={astrologer.id}
                astrologer={astrologer}
                onChat={() => handleActionWithAstrologer(astrologer)}
                fullWidth={true}
                mode={mode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 shadow-lg z-20">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setCurrentScreen('chat')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              mode === 'chat' ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className={`text-xs ${mode === 'chat' ? 'font-semibold' : ''}`}>Chat</span>
          </button>
          <button
            onClick={() => setCurrentScreen('call')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              mode === 'call' ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className={`text-xs ${mode === 'call' ? 'font-semibold' : ''}`}>Call</span>
          </button>
          <button
            onClick={() => setCurrentScreen('remedies')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs">Remedies</span>
          </button>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
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

