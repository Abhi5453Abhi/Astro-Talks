'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import type {
  DailyHoroscopePayload,
  HoroscopeInsight,
  HoroscopeSection,
} from '@/types/horoscope'
import { ZODIAC_SIGNS } from '@/types/horoscope'

type InsightKey = 'weekly' | 'monthly' | 'yearly'

const zodiacGlyphs: Record<string, string> = {
  Aries: '♈️',
  Taurus: '♉️',
  Gemini: '♊️',
  Cancer: '♋️',
  Leo: '♌️',
  Virgo: '♍️',
  Libra: '♎️',
  Scorpio: '♏️',
  Sagittarius: '♐️',
  Capricorn: '♑️',
  Aquarius: '♒️',
  Pisces: '♓️',
}

export default function DailyHoroscope() {
  const {
    userProfile,
    setCurrentScreen,
    dailyHoroscope,
    dailyHoroscopeDate,
    setDailyHoroscope,
    dailyHoroscopeCache,
    setDailyHoroscopeForSign,
    removeDailyHoroscopeForSign,
  } = useStore()
  const defaultSign =
    dailyHoroscope?.zodiacSign || userProfile?.zodiacSign || 'Aries'
  const [selectedSign, setSelectedSign] = useState<string>(defaultSign)
  const selectedSignKey = selectedSign.toLowerCase()
  const currentHoroscope =
    dailyHoroscopeCache[selectedSignKey] || null
  const [loading, setLoading] = useState(!currentHoroscope)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<InsightKey>('weekly')
  const [selectedDay, setSelectedDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showMoodSelector, setShowMoodSelector] = useState(false)

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-orange-400' },
    { emoji: '😔', label: 'Sad', color: 'from-blue-400 to-blue-600' },
    { emoji: '😰', label: 'Anxious', color: 'from-purple-400 to-purple-600' },
    { emoji: '😌', label: 'Calm', color: 'from-green-400 to-green-600' },
    { emoji: '😤', label: 'Frustrated', color: 'from-red-400 to-red-600' },
    { emoji: '🤔', label: 'Confused', color: 'from-gray-400 to-gray-600' },
    { emoji: '😍', label: 'Excited', color: 'from-pink-400 to-pink-600' },
    { emoji: '😴', label: 'Tired', color: 'from-indigo-400 to-indigo-600' },
  ]

  const glyph = useMemo(() => {
    return zodiacGlyphs[selectedSign] ?? '✨'
  }, [selectedSign])

  const loadHoroscope = useCallback(
    async (profile: typeof userProfile, sign: string, day: 'yesterday' | 'today' | 'tomorrow' = 'today', signal?: AbortSignal) => {
      if (!profile) return
      try {
        setLoading(true)
        setError(null)
        const requestSign = sign || profile.zodiacSign || 'Aries'
        
        // Calculate date offset
        const dateOffset = day === 'yesterday' ? -1 : day === 'tomorrow' ? 1 : 0
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + dateOffset)

        const response = await fetch('/api/horoscope/daily', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userProfile: {
              ...profile,
              zodiacSign: requestSign,
            },
            referenceDate: targetDate.toISOString().split('T')[0],
            mood: selectedMood, // Pass user's selected mood
          }),
          signal,
        })

        if (!response.ok) {
          const detail = await response.json().catch(() => ({}))
          throw new Error(detail?.message || 'Failed to fetch horoscope')
        }

        const data = (await response.json()) as DailyHoroscopePayload
        const signKey = requestSign.toLowerCase()
        setDailyHoroscopeForSign(requestSign, data)

        if (
          profile?.zodiacSign &&
          profile.zodiacSign.toLowerCase() === signKey
        ) {
          setDailyHoroscope(
            data,
            data.date ?? targetDate.toISOString().split('T')[0]
          )
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        console.error('Horoscope fetch error:', err)
        setError(err?.message || 'Unable to fetch horoscope')
      } finally {
        setLoading(false)
      }
    },
    [setDailyHoroscope, setDailyHoroscopeForSign]
  )

  // Always initialize with user's zodiac sign and load it on mount
  useEffect(() => {
    if (!userProfile) {
      setCurrentScreen('onboarding')
      return
    }

    // Set user's zodiac sign as selected on mount
    if (userProfile.zodiacSign && selectedSign !== userProfile.zodiacSign) {
      setSelectedSign(userProfile.zodiacSign)
    }

    if (currentHoroscope || Object.keys(dailyHoroscopeCache).length > 0) {
      setLoading(false)
    }
    
    // Show mood selector after a short delay for first-time users
    if (!selectedMood) {
      setTimeout(() => setShowMoodSelector(true), 1000)
    }
  }, [userProfile, setCurrentScreen, currentHoroscope, dailyHoroscopeCache])

  // Load horoscope when day or mood changes
  useEffect(() => {
    if (userProfile && (selectedDay !== 'today' || selectedMood)) {
      loadHoroscope(userProfile, selectedSign, selectedDay)
    }
  }, [selectedDay, selectedMood, userProfile, selectedSign, loadHoroscope])

  const handleBack = () => {
    setCurrentScreen('home')
  }

  const handleRetry = () => {
    if (!userProfile) return
    setActiveTab('weekly')
    setError(null)
    if (selectedSignKey === userSignKey) {
      setDailyHoroscope(null, null)
    }
    removeDailyHoroscopeForSign(selectedSign)
    setLoading(true)
    loadHoroscope(userProfile, selectedSign, selectedDay)
  }

  const handleShare = async () => {
    if (!currentHoroscope) return
    const shareText = `${userProfile?.name || 'Your'} ${currentHoroscope.zodiacSign} horoscope for ${currentHoroscope.date}:\n${currentHoroscope.summary}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Horoscope',
          text: shareText,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('Horoscope copied to clipboard!')
    }
  }

  const handleSelectSign = (sign: string) => {
    setSelectedSign(sign)
    setActiveTab('weekly')
    setError(null)
    setLoading(false)
  }

  const renderSection = (section: HoroscopeSection) => (
    <motion.div
      key={section.title}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-yellow-400/20 bg-white/5 backdrop-blur-md p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconForSection(section.title)}</span>
          <span className="text-lg font-semibold text-white">{section.title}</span>
        </div>
        <span className="text-lg font-semibold text-yellow-300">{section.score}%</span>
      </div>
      <p className="mt-3 text-sm text-white/80 leading-relaxed">{section.summary}</p>
    </motion.div>
  )

  const renderInsight = (insight: HoroscopeInsight) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white">{insight.title}</h3>
        <p className="text-sm text-yellow-300 mt-1">{insight.dateRange}</p>
      </div>
      <p className="text-white/80 leading-relaxed">{insight.overview}</p>
      <div className="space-y-5">
        {insight.sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h4 className="text-lg font-semibold text-yellow-200">{section.title}</h4>
            <p className="text-white/80 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (!userProfile) {
    return null
  }

  const userSignKey = userProfile?.zodiacSign?.toLowerCase() || ''
  const displayDate =
    currentHoroscope?.date ||
    (selectedSignKey === userSignKey ? dailyHoroscopeDate : undefined) ||
    new Date().toISOString().split('T')[0]

  const getMoodMessage = (mood: string, name: string) => {
    const messages: Record<string, string> = {
      Happy: `That's wonderful, ${name}! The universe is celebrating with you. Your positive energy will attract amazing opportunities today!`,
      Sad: `I hear you, ${name}. Remember, even the darkest night will end and the sun will rise. The stars are aligning to bring you comfort and hope.`,
      Anxious: `Take a deep breath, ${name}. The cosmos has your back. Channel this energy into positive action - you're stronger than you know!`,
      Calm: `Beautiful energy, ${name}! This peaceful state will help you see opportunities clearly. Trust your inner wisdom today.`,
      Frustrated: `${name}, I understand. Sometimes challenges are the universe's way of redirecting you to something better. Stay strong!`,
      Confused: `It's okay to feel uncertain, ${name}. The stars suggest taking time to reflect. Clarity is coming your way soon!`,
      Excited: `Your enthusiasm is contagious, ${name}! The universe loves this energy. Channel it wisely and watch miracles unfold!`,
      Tired: `Rest is important, ${name}. The universe is reminding you to recharge. Tomorrow brings renewed energy and fresh possibilities!`,
    }
    return messages[mood] || `The universe hears you, ${name}. Trust the journey - better days are ahead! ✨`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pb-32">
      <header className="sticky top-0 z-20 bg-slate-950/60 backdrop-blur-lg border-b border-white/5">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur transition hover:border-white/30 hover:bg-white/20 hover:shadow-lg"
          >
            <IconArrowLeft className="h-5 w-5 transition group-hover:scale-110" />
            <span className="pointer-events-none absolute -bottom-9 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-900 opacity-0 shadow-sm transition group-hover:opacity-100">
              Back
            </span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-[0.3em] text-yellow-300/70">Daily Horoscope</span>
            <span className="text-lg font-semibold">
              {userProfile.name ? `${userProfile.name}'s` : 'Your'} Journey
            </span>
          </div>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share horoscope"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur transition hover:border-white/30 hover:bg-white/20 hover:shadow-lg"
          >
            <IconShare className="h-5 w-5 transition group-hover:scale-110" />
            <span className="pointer-events-none absolute -bottom-9 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-900 opacity-0 shadow-sm transition group-hover:opacity-100">
              Share
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8">
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300/70">Select Sign</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {ZODIAC_SIGNS.map((sign) => {
              const isActive = sign === selectedSign
              const isUserSign = sign === userProfile?.zodiacSign
              return (
                <button
                  key={sign}
                  type="button"
                  onClick={() => handleSelectSign(sign)}
                  className={`flex flex-col items-center justify-center min-w-[72px] gap-2 rounded-3xl border px-4 py-3 transition relative ${
                    isActive
                      ? 'border-yellow-400/80 bg-yellow-400/20 shadow-lg shadow-yellow-500/30'
                      : isUserSign
                      ? 'border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {isUserSign && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900 animate-pulse" />
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-yellow-400 whitespace-nowrap">
                        YOU
                      </div>
                    </>
                  )}
                  <span className="text-2xl">{zodiacGlyphs[sign] ?? '✨'}</span>
                  <span className={`text-xs font-semibold tracking-wide ${isUserSign ? 'text-yellow-300' : 'text-white/80'}`}>
                    {sign}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              {(['yesterday', 'today', 'tomorrow'] as const).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition ${
                    selectedDay === day
                      ? 'bg-yellow-400 text-slate-900 shadow-md shadow-yellow-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <AnimatePresence>
            {showMoodSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300/70">How are you feeling today?</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.label}
                      type="button"
                      onClick={() => {
                        setSelectedMood(mood.label)
                        // Reload horoscope with new mood
                        if (userProfile) {
                          setTimeout(() => {
                            loadHoroscope(userProfile, selectedSign, selectedDay)
                          }, 300)
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                        selectedMood === mood.label
                          ? `border-yellow-400/80 bg-gradient-to-br ${mood.color} bg-opacity-20 shadow-lg shadow-yellow-500/30`
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-xs font-semibold text-white/80">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-yellow-400/10 to-yellow-500/5 border border-yellow-400/20"
                  >
                    <p className="text-sm text-yellow-200 text-center font-light">
                      ✨ {getMoodMessage(selectedMood, userProfile?.name || 'friend')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent p-6 shadow-2xl shadow-yellow-500/20 backdrop-blur-md"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-yellow-300">
                <span className="text-4xl">{glyph}</span>
                <div>
                  <p className="text-sm uppercase tracking-[0.4em]">
                    {selectedDay === 'yesterday' ? 'Yesterday' : selectedDay === 'tomorrow' ? 'Tomorrow' : 'Today'}
                  </p>
                  <h1 className="text-2xl font-bold">
                    {userProfile?.name && selectedSign === userProfile?.zodiacSign 
                      ? `${userProfile.name}'s ${selectedSign}` 
                      : currentHoroscope?.zodiacSign ?? selectedSign ?? 'Your Sign'}
                  </h1>
                </div>
              </div>
              {/* Main Message */}
              {currentHoroscope?.mainMessage ? (
                <div className="mt-4 space-y-4">
                  <p className="text-white/90 leading-relaxed max-w-xl text-base">
                    {currentHoroscope.mainMessage}
                  </p>
                  
                  {/* Micro Prediction */}
                  {currentHoroscope.microPrediction && (
                    <div className="mt-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                      <p className="text-yellow-200 text-sm font-medium">
                        💫 {currentHoroscope.microPrediction}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Step */}
                  {currentHoroscope.actionStep && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30">
                      <p className="text-yellow-300 text-sm font-semibold">
                        ✨ {currentHoroscope.actionStep}
                      </p>
                    </div>
                  )}
                </div>
              ) : currentHoroscope?.summary ? (
                <p className="mt-4 text-white/80 leading-relaxed max-w-xl">
                  {currentHoroscope.summary}
                </p>
              ) : (
                <p className="mt-4 text-white/80 leading-relaxed max-w-xl">
                  The cosmos are aligning to reveal fresh insights. Hang tight while we chart your stars and prepare your personalized guidance.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-950/40 p-4 border border-yellow-400/20">
              <Stat label="Lucky Colours" value={(currentHoroscope?.luckyColors ?? []).join(', ') || '—'} />
              <Stat label="Mood of the Day" value={currentHoroscope?.moodOfDay ?? '—'} />
              <Stat label="Lucky Number" value={currentHoroscope?.luckyNumber ?? '—'} />
              <Stat label="Lucky Time" value={currentHoroscope?.luckyTime ?? '—'} />
            </div>
          </div>
          <div className="mt-6 text-sm text-white/60">
            {`Generated for ${displayDate} · ${
              userProfile.placeOfBirth ? `Place: ${userProfile.placeOfBirth}` : 'Place of birth not provided'
            }`}
          </div>
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="rounded-full border-4 border-yellow-400/30 border-t-yellow-300/80 p-6"
            />
            <p className="text-white/80">Consulting the stars for your personalized guidance…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
            <p className="text-lg font-semibold text-white">Something went wrong</p>
            <p className="text-white/80">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-slate-900 font-semibold hover:bg-yellow-300 transition"
            >
              <IconRefresh className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!loading && currentHoroscope && (
          <>
            <section className="space-y-5">
              {currentHoroscope.sections.map(renderSection)}
            </section>

              <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3">
                  {(['weekly', 'monthly', 'yearly'] as InsightKey[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                        activeTab === tab
                          ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {tab === 'weekly' ? 'Weekly Horoscope' : tab === 'monthly' ? 'Monthly Horoscope' : 'Yearly Horoscope'}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {renderInsight(currentHoroscope.insights[activeTab])}
                  </motion.div>
                </AnimatePresence>
              </section>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/70">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  )
}

function iconForSection(title: string) {
  const normalized = title.toLowerCase()
  if (normalized.includes('love')) return '❤️'
  if (normalized.includes('career')) return '💼'
  if (normalized.includes('money') || normalized.includes('finance')) return '💰'
  if (normalized.includes('health')) return '🩺'
  if (normalized.includes('travel')) return '✈️'
  return '✨'
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
    </svg>
  )
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 6l-4-4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v14" />
    </svg>
  )
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 11a8.001 8.001 0 01-14.906 3M4 13v4h4M4 13a8.001 8.001 0 0114.906-3M20 11V7h-4"
      />
    </svg>
  )
}

