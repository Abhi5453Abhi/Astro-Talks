'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const zodiacGlyphs: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
}

export default function FreeServices() {
  const { setCurrentScreen, userProfile } = useStore()
  const [horoscopeData, setHoroscopeData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today')
  const userZodiacSign = userProfile?.zodiacSign || 'Aries'

  // Fetch horoscope data based on selected day
  useEffect(() => {
    const fetchHoroscope = async () => {
      if (!userProfile?.zodiacSign) return
      
      setLoading(true)
      try {
        const dateOffset = selectedDay === 'yesterday' ? -1 : selectedDay === 'tomorrow' ? 1 : 0
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + dateOffset)
        
        const response = await fetch('/api/horoscope/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: {
              ...userProfile,
              zodiacSign: userProfile.zodiacSign
            },
            referenceDate: targetDate.toISOString().split('T')[0],
            mood: null, // No mood selector on FreeServices page
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setHoroscopeData(data)
        }
      } catch (error) {
        console.error('Error fetching horoscope:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHoroscope()
  }, [selectedDay, userProfile])

  const handleDayChange = (day: 'yesterday' | 'today' | 'tomorrow') => {
    setSelectedDay(day)
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Free Services</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32 space-y-6">
        {/* Daily Horoscope Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 relative overflow-hidden"
        >
          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden">
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
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">
                {userProfile?.name ? `${userProfile.name}'s` : 'Your'} Daily Horoscope
              </h2>
              <span className="text-yellow-400 font-bold text-lg">{userZodiacSign}</span>
            </div>

            {/* Day Selector */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex rounded-full border border-white/20 bg-white/5 p-1">
                {(['yesterday', 'today', 'tomorrow'] as const).map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                      selectedDay === day
                        ? 'bg-yellow-400 text-slate-900 shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full"
                />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-4">
                    {/* Lucky Colours */}
                    <div>
                      <p className="text-white/70 text-sm mb-2">Lucky Colours</p>
                      <div className="flex gap-2">
                        {horoscopeData?.luckyColors && horoscopeData.luckyColors.length > 0 ? (
                          horoscopeData.luckyColors.slice(0, 3).map((color: string, idx: number) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 border-white/20"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-green-500"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lucky Number & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm mb-1">Lucky Number</p>
                        <p className="text-white text-2xl font-bold">
                          {horoscopeData?.luckyNumber || '4'}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Lucky Time</p>
                        <p className="text-white text-2xl font-bold">
                          {horoscopeData?.luckyTime || '6:30 AM'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Zodiac Avatar */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="relative w-32 h-32">
                      {/* Golden ring - highlighted for user's sign */}
                      <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-pulse"></div>
                      {/* Avatar placeholder */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center">
                        <span className="text-4xl">{zodiacGlyphs[userZodiacSign]}</span>
                      </div>
                      {/* Zodiac symbol badge */}
                      <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl border-2 border-white">
                        {zodiacGlyphs[userZodiacSign]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mood of day */}
                <div className="mb-6">
                  <p className="text-white/70 text-sm mb-2">Mood of day</p>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{horoscopeData?.moodOfDay || '😴'}</div>
                    {horoscopeData?.summary && (
                      <p className="text-white/80 text-sm leading-relaxed">
                        {horoscopeData.summary.substring(0, 80)}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => setCurrentScreen('daily-horoscope')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-full flex items-center justify-between hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg"
                >
                  <span>View your Detailed Horoscope</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Free Kundli Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
          {/* Icon */}
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    opacity: Math.random() * 0.6 + 0.2,
                  }}
                />
              ))}
            </div>
            {/* Kundli Chart */}
            <div className="relative z-10">
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-yellow-400">
                <rect x="5" y="5" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)" />
                <rect x="25" y="25" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-gray-900 text-xl font-bold mb-2">Free Kundli</h3>
            <p className="text-gray-600 text-sm mb-3">Enter your birth details & get a personalized Kundli report with detailed analysis.</p>
            <button
              onClick={() => setCurrentScreen('free-kundli')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md"
            >
              Get report
            </button>
          </div>
        </motion.div>

        {/* Match-Making Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-gray-900 text-xl font-bold mb-2">Match-Making</h3>
            <p className="text-gray-600 text-sm mb-3">Check marriage compatibility & the strength of your love life by matching your Kundli.</p>
            <button
              onClick={() => setCurrentScreen('kundli-matching')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md"
            >
              Get report
            </button>
          </div>

          {/* Icon */}
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    opacity: Math.random() * 0.6 + 0.2,
                  }}
                />
              ))}
            </div>
            {/* Rings */}
            <div className="relative z-10">
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <circle cx="35" cy="50" r="20" fill="none" stroke="#fbbf24" strokeWidth="4" />
                <circle cx="65" cy="50" r="20" fill="none" stroke="#fbbf24" strokeWidth="4" />
                <path d="M 50 35 L 50 25 L 55 30 L 50 35 L 45 30 Z" fill="#facc15" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Track Your Planets Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          {/* Icon */}
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    opacity: Math.random() * 0.6 + 0.2,
                  }}
                />
              ))}
            </div>
            {/* Planets */}
            <div className="relative z-10 w-20 h-20">
              <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500"></div>
              <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <div className="absolute w-20 h-2 bg-yellow-400 transform -rotate-12 opacity-60"></div>
              </div>
              <div className="absolute top-2 left-8 w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
              <div className="absolute bottom-8 right-2 w-2 h-2 rounded-full bg-yellow-300"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-gray-900 text-xl font-bold mb-2">Track your planets</h3>
            <p className="text-gray-600 text-sm mb-3">Keep a track of the movements of your planets and know the impact they bring in your daily life.</p>
            <button
              onClick={() => setCurrentScreen('remedies')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md"
            >
              Track now
            </button>
          </div>
        </motion.div>

        {/* Today's Panchang Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 text-xl font-bold">Today's Panchang</h3>
            <p className="text-gray-500 text-sm">New Delhi, Delhi India</p>
          </div>

          {/* Sunrise/Sunset & Moonrise/Moonset */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-orange-200 rounded-2xl p-4 bg-orange-50/50">
              <p className="text-gray-600 text-sm mb-2">Sunrise - Sunset</p>
              <div className="flex items-center gap-2 text-orange-600 font-bold text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <span>06:55-17:24</span>
              </div>
            </div>

            <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/50">
              <p className="text-gray-600 text-sm mb-2">Moonrise - Moonset</p>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span>13:20-05:30</span>
              </div>
            </div>
          </div>

          {/* Astrological Timings */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nakshatra</span>
              <span className="text-gray-900 font-semibold">Yoga</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shatabhisha</span>
              <span className="text-gray-900 font-semibold">Harshana</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tithi</span>
              <span className="text-gray-900 font-semibold">Paksha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Navami</span>
              <span className="text-gray-900 font-semibold">Shukla</span>
            </div>
          </div>

          {/* View More Button */}
          <button className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md">
            <span>View More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3">
        <button
          onClick={() => setCurrentScreen('chat')}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-4 rounded-full flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg text-sm sm:text-base"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span className="whitespace-nowrap">Chat with Astrologer</span>
        </button>

        <button
          onClick={() => setCurrentScreen('call')}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-4 rounded-full flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg text-sm sm:text-base"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span className="whitespace-nowrap">Call with Astrologer</span>
        </button>
      </div>
    </div>
  )
}

