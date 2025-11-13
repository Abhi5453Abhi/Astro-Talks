'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import { getZodiacSign } from '@/lib/utils'
import { ZODIAC_SIGNS } from '@/types/horoscope'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [languages, setLanguages] = useState<('english' | 'hindi' | 'punjabi')[]>([])
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [birthDate, setBirthDate] = useState({ day: 1, month: 1, year: new Date().getFullYear() - 25 })
  const [birthTime, setBirthTime] = useState('')
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0, period: 'PM' as 'AM' | 'PM' })
  const [unknownBirthTime, setUnknownBirthTime] = useState(false)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [isLoading, setIsLoading] = useState(false)
  const [dateScrollPosition, setDateScrollPosition] = useState({ day: 0, month: 0, year: 0 })
  const [timeScrollPosition, setTimeScrollPosition] = useState({ hour: 0, minute: 0, period: 0 })

  const dayRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef<HTMLDivElement>(null)

  const { setUserProfile, setDailyHoroscope, setDailyHoroscopeForSign } = useStore()
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name)
    }
  }, [session?.user?.name, name])

  // Debug: Track step changes
  useEffect(() => {
    console.log('📍 Current step:', step)
    console.log('📊 Step titles:', [
      '0: Language Selection',
      '1: Name',
      '2: Date of Birth',
      '3: Birth Time',
      '4: Gender'
    ])
  }, [step])

  // Initialize scroll positions when step changes
  useEffect(() => {
    if (step === 2) {
      // Wait for DOM to be ready
      setTimeout(() => {
        scrollToDateCenter(dayRef, birthDate.day - 1)
        scrollToDateCenter(monthRef, birthDate.month - 1)
        const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
        scrollToDateCenter(yearRef, years.indexOf(birthDate.year))
        
        // After scrolling completes, sync state with what's actually in the highlight bar
        setTimeout(() => {
          // Force sync by calling handleDateScroll for all columns
          // This ensures state matches what's visually in the highlight bar
          handleDateScroll('day')
          handleDateScroll('month')
          handleDateScroll('year')
        }, 200)
      }, 200)
    }
    if (step === 3) {
      // Wait for DOM to be ready
      setTimeout(() => {
        const hours = Array.from({ length: 12 }, (_, i) => i + 1)
        const hourIndex = hours.indexOf(timeValue.hour)
        const periodIndex = ['AM', 'PM'].indexOf(timeValue.period)
        
        // Scroll to initial positions - use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          if (hourRef.current) {
            scrollToTimeCenter(hourRef, hourIndex)
            // Ensure hour 12 (index 11) is selected
            if (timeValue.hour === 12 && hourIndex === 11) {
              setTimeout(() => {
                const container = hourRef.current
                if (container) {
                  const itemHeight = 48
                  const paddingTop = 96
                  const containerHeight = container.clientHeight || 240
                  const itemTop = paddingTop + (11 * itemHeight)
                  const itemCenter = itemTop + (itemHeight / 2)
                  const viewportCenter = containerHeight / 2
                  const scrollPosition = itemCenter - viewportCenter
                  container.scrollTop = Math.max(0, scrollPosition)
                }
              }, 50)
            }
          }
          if (minuteRef.current) {
            scrollToTimeCenter(minuteRef, timeValue.minute)
          }
          if (periodRef.current) {
            scrollToTimeCenter(periodRef, periodIndex)
            // Ensure PM (index 1) is correctly positioned
            if (timeValue.period === 'PM' && periodIndex === 1) {
              setTimeout(() => {
                const container = periodRef.current
                if (container) {
                  const itemHeight = 48
                  const paddingTop = 96
                  const containerHeight = container.clientHeight || 240
                  const itemTop = paddingTop + (1 * itemHeight)
                  const itemCenter = itemTop + (itemHeight / 2)
                  const viewportCenter = containerHeight / 2
                  const scrollPosition = itemCenter - viewportCenter
                  container.scrollTop = Math.max(0, scrollPosition)
                }
              }, 50)
            }
          }
          
          // After scrolling completes, sync state with what's actually in the highlight bar
          setTimeout(() => {
            // Force sync by calling handleTimeScroll for all columns
            // This ensures state matches what's visually in the highlight bar
            if (hourRef.current) handleTimeScroll('hour')
            if (minuteRef.current) handleTimeScroll('minute')
            if (periodRef.current) handleTimeScroll('period')
          }, 350)
        })
      }, 300)
    }
  }, [step])

  const toggleLanguage = (lang: 'english' | 'hindi' | 'punjabi') => {
    console.log('🔄 Toggling language:', lang)
    setLanguages(prev => {
      const newLanguages = prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
      console.log('✅ Updated languages:', newLanguages)
      return newLanguages
    })
  }

  const formatDate = (date: { day: number; month: number; year: number }) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return `${monthNames[date.month - 1]} ${date.day}, ${date.year}`
  }

  const formatTime = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')} ${time.period}`
  }

  const convertToISODate = (date: { day: number; month: number; year: number }) => {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`
  }

  const convertTo24Hour = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    let hour = time.hour
    if (time.period === 'PM' && hour !== 12) {
      hour += 12
    } else if (time.period === 'AM' && hour === 12) {
      hour = 0
    }
    return `${hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`
  }

  const scrollToDateCenter = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48
      const paddingTop = 96
      const containerHeight = container.clientHeight || 240 // Fallback to 240 if not yet rendered
      // Calculate scroll position to center the item at the given index
      // The center of the viewport should align with the center of the item
      const itemTop = paddingTop + (index * itemHeight)
      const itemCenter = itemTop + (itemHeight / 2)
      const viewportCenter = containerHeight / 2
      const scrollPosition = itemCenter - viewportCenter
      container.scrollTop = Math.max(0, scrollPosition)
    }
  }

  const scrollToTimeCenter = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48
      const paddingTop = 96
      const containerHeight = container.clientHeight || 240 // Fallback to 240 if not yet rendered
      // Calculate scroll position to center the item at the given index
      // The center of the viewport should align with the center of the item
      const itemTop = paddingTop + (index * itemHeight)
      const itemCenter = itemTop + (itemHeight / 2)
      const viewportCenter = containerHeight / 2
      const scrollPosition = itemCenter - viewportCenter
      container.scrollTop = Math.max(0, scrollPosition)
      // Force a reflow to ensure scroll position is set
      container.offsetHeight
    }
  }

  const handleDateScroll = (type: 'day' | 'month' | 'year') => {
    const ref = type === 'day' ? dayRef : type === 'month' ? monthRef : yearRef
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48
      const paddingTop = 96
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      // Calculate which item is at the center
      const viewportCenter = scrollTop + containerHeight / 2
      const firstItemCenter = paddingTop + itemHeight / 2
      const centerIndex = Math.round((viewportCenter - firstItemCenter) / itemHeight)
      
      if (type === 'day') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 30))
        const selectedDay = clampedIndex + 1
        setBirthDate(prev => {
          const newDate = { ...prev, day: selectedDay }
          setDateOfBirth(convertToISODate(newDate))
          return newDate
        })
        setDateScrollPosition(prev => ({ ...prev, day: scrollTop }))
      } else if (type === 'month') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 11))
        const selectedMonth = clampedIndex + 1
        setBirthDate(prev => {
          const newDate = { ...prev, month: selectedMonth }
          setDateOfBirth(convertToISODate(newDate))
          return newDate
        })
        setDateScrollPosition(prev => ({ ...prev, month: scrollTop }))
      } else {
        const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
        const clampedIndex = Math.max(0, Math.min(centerIndex, years.length - 1))
        const selectedYear = years[clampedIndex]
        setBirthDate(prev => {
          const newDate = { ...prev, year: selectedYear }
          setDateOfBirth(convertToISODate(newDate))
          return newDate
        })
        setDateScrollPosition(prev => ({ ...prev, year: scrollTop }))
      }
    }
  }

  const handleTimeScroll = (type: 'hour' | 'minute' | 'period') => {
    const ref = type === 'hour' ? hourRef : type === 'minute' ? minuteRef : periodRef
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48
      const paddingTop = 96
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      // Calculate which item is at the center
      const viewportCenter = scrollTop + containerHeight / 2
      const firstItemCenter = paddingTop + itemHeight / 2
      const centerIndex = Math.round((viewportCenter - firstItemCenter) / itemHeight)
      
      if (type === 'hour') {
        const hours = Array.from({ length: 12 }, (_, i) => i + 1)
        const clampedIndex = Math.max(0, Math.min(centerIndex, hours.length - 1))
        const selectedHour = hours[clampedIndex]
        // Only update if the hour actually changed to avoid unnecessary re-renders
        setTimeValue(prev => {
          if (prev.hour === selectedHour) return prev
          const newTime = { ...prev, hour: selectedHour }
          setBirthTime(convertTo24Hour(newTime))
          return newTime
        })
        setTimeScrollPosition(prev => ({ ...prev, hour: scrollTop }))
      } else if (type === 'minute') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 59))
        const selectedMinute = clampedIndex
        // Only update if the minute actually changed to avoid unnecessary re-renders
        setTimeValue(prev => {
          if (prev.minute === selectedMinute) return prev
          const newTime = { ...prev, minute: selectedMinute }
          setBirthTime(convertTo24Hour(newTime))
          return newTime
        })
        setTimeScrollPosition(prev => ({ ...prev, minute: scrollTop }))
      } else {
        const periods = ['AM', 'PM']
        const clampedIndex = Math.max(0, Math.min(centerIndex, periods.length - 1))
        const selectedPeriod = periods[clampedIndex] as 'AM' | 'PM'
        // Only update if the period actually changed to avoid unnecessary re-renders
        setTimeValue(prev => {
          if (prev.period === selectedPeriod) return prev
          const newTime = { ...prev, period: selectedPeriod }
          setBirthTime(convertTo24Hour(newTime))
          return newTime
        })
        setTimeScrollPosition(prev => ({ ...prev, period: scrollTop }))
      }
    }
  }

  const getDate3DTransform = (
    index: number,
    ref: React.RefObject<HTMLDivElement>,
    itemHeight: number,
    paddingTop: number,
    containerHeight: number
  ) => {
    if (!ref.current) {
      // Return full size for selected items on initial load
      let isSelected = false
      if (ref === dayRef) {
        isSelected = index + 1 === birthDate.day
      } else if (ref === monthRef) {
        isSelected = index + 1 === birthDate.month
      } else if (ref === yearRef) {
        const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
        isSelected = years[index] === birthDate.year
      }
      return isSelected ? { transform: 'scale(1) rotateX(0deg)', opacity: 1 } : { transform: 'scale(0.8) rotateX(10deg)', opacity: 0.5 }
    }
    
    const scrollTop = ref === dayRef ? dateScrollPosition.day : ref === monthRef ? dateScrollPosition.month : dateScrollPosition.year
    const viewportCenter = scrollTop + containerHeight / 2
    
    const itemTop = paddingTop + (index * itemHeight)
    const itemCenter = itemTop + itemHeight / 2
    const distanceFromCenter = itemCenter - viewportCenter
    const normalizedDistance = distanceFromCenter / (containerHeight / 2)
    
    // Less aggressive scaling - keep items closer to full size
    const scale = Math.max(0.8, 1 - Math.abs(normalizedDistance) * 0.2)
    const opacity = Math.max(0.5, 1 - Math.abs(normalizedDistance) * 0.5)
    const rotation = normalizedDistance * 10 // Reduced rotation
    
    return {
      transform: `scale(${scale}) rotateX(${rotation}deg)`,
      opacity: opacity
    }
  }

  const getTime3DTransform = (
    index: number,
    ref: React.RefObject<HTMLDivElement>,
    itemHeight: number,
    paddingTop: number,
    containerHeight: number
  ) => {
    if (!ref.current) {
      // Return full size for selected items on initial load
      let isSelected = false
      if (ref === hourRef) {
        const hours = Array.from({ length: 12 }, (_, i) => i + 1)
        isSelected = hours[index] === timeValue.hour
      } else if (ref === minuteRef) {
        isSelected = index === timeValue.minute
      } else if (ref === periodRef) {
        isSelected = ['AM', 'PM'][index] === timeValue.period
      }
      return isSelected ? { transform: 'scale(1) rotateX(0deg)', opacity: 1 } : { transform: 'scale(0.8) rotateX(10deg)', opacity: 0.5 }
    }
    
    const scrollTop = ref === hourRef ? timeScrollPosition.hour : ref === minuteRef ? timeScrollPosition.minute : timeScrollPosition.period
    const viewportCenter = scrollTop + containerHeight / 2
    
    const itemTop = paddingTop + (index * itemHeight)
    const itemCenter = itemTop + itemHeight / 2
    const distanceFromCenter = itemCenter - viewportCenter
    const normalizedDistance = distanceFromCenter / (containerHeight / 2)
    
    // Less aggressive scaling - keep items closer to full size
    const scale = Math.max(0.8, 1 - Math.abs(normalizedDistance) * 0.2)
    const opacity = Math.max(0.5, 1 - Math.abs(normalizedDistance) * 0.5)
    const rotation = normalizedDistance * 10 // Reduced rotation
    
    return {
      transform: `scale(${scale}) rotateX(${rotation}deg)`,
      opacity: opacity
    }
  }

  const handleStepChange = (newStep: number) => {
    console.log(`🚀 Step change: ${step} → ${newStep}`)
    console.log('Current state:', {
      languages,
      name,
      dateOfBirth,
      birthTime,
      unknownBirthTime,
      gender
    })
    setStep(newStep)
  }

  const handleComplete = async () => {
    console.log('🎯 Starting onboarding completion...')
    console.log('Final user data:', {
      name,
      dateOfBirth,
      birthTime: unknownBirthTime ? undefined : birthTime,
      gender,
      languages
    })
    
    setIsLoading(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const zodiacSign = getZodiacSign(dateOfBirth)
    console.log('✨ Calculated zodiac sign:', zodiacSign)

    const profile = {
      name,
      dateOfBirth,
      birthTime: unknownBirthTime ? undefined : birthTime,
      gender,
      languages,
      zodiacSign,
    }

    void (async () => {
      const today = new Date().toISOString().split('T')[0]
      for (const sign of ZODIAC_SIGNS) {
        try {
          const response = await fetch('/api/horoscope/daily', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userProfile: {
                ...profile,
                zodiacSign: sign,
              },
              referenceDate: today,
            }),
          })

          if (!response.ok) {
            const detail = await response.json().catch(() => ({}))
            console.error(`⚠️ Failed to fetch ${sign} horoscope:`, detail)
            continue
          }

          const data = await response.json()
          setDailyHoroscopeForSign(sign, data)

          if (sign === profile.zodiacSign) {
            setDailyHoroscope(data, data.date ?? today)
            console.log('🌟 Daily horoscope cached successfully')
          }
        } catch (error) {
          console.error(`⚠️ Error fetching ${sign} horoscope:`, error)
        }
      }
    })()

    setUserProfile(profile)
    
    console.log('✅ User profile saved successfully!')
    setIsLoading(false)
  }

  const steps = [
    {
      title: 'Choose Your Language(s)',
      subtitle: 'Select one or more languages',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-center text-gray-400 text-sm font-light mb-8 tracking-wide">Select all languages you're comfortable with</p>
          <div className="space-y-3">
            {[
              { value: 'english', label: 'English' },
              { value: 'hindi', label: 'हिंदी (Hindi)' },
              { value: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
            ].map((lang, index) => (
              <motion.button
                key={lang.value}
                onClick={() => toggleLanguage(lang.value as any)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full group relative overflow-hidden ${
                  languages.includes(lang.value as any)
                    ? 'bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20'
                    : 'bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60'
                } backdrop-blur-sm rounded-2xl p-5 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-medium tracking-wide ${
                    languages.includes(lang.value as any) ? 'text-yellow-400' : 'text-gray-300 group-hover:text-white'
                  } transition-colors duration-300`}>
                    {lang.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    languages.includes(lang.value as any)
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}>
                    {languages.includes(lang.value as any) && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={() => handleStepChange(1)}
            disabled={languages.length === 0}
            whileHover={{ scale: languages.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: languages.length > 0 ? 0.98 : 1 }}
            className={`w-full mt-10 py-4 px-8 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
              languages.length > 0
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40'
                : 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: 'What is your name?',
      subtitle: 'Let me know how to address you, dear soul',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-5 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 text-lg font-light tracking-wide"
              autoFocus
            />
          </div>
          <div className="flex gap-4 pt-2">
            <motion.button
              onClick={() => handleStepChange(0)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 px-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 rounded-2xl font-medium text-gray-300 transition-all duration-300"
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => handleStepChange(2)}
              disabled={!name.trim()}
              whileHover={{ scale: name.trim() ? 1.02 : 1 }}
              whileTap={{ scale: name.trim() ? 0.98 : 1 }}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
                name.trim()
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40'
                  : 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'When were you born?',
      subtitle: 'Your cosmic blueprint begins here',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Inline Date Picker */}
          <div className="flex gap-1 sm:gap-2">
            {/* Day Column */}
            <div className="flex-1 min-w-0 relative">
              <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Day</div>
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
              <div
                ref={dayRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleDateScroll('day')}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day, index) => {
                  const transform = getDate3DTransform(index, dayRef, 48, 96, 240)
                  return (
                    <div
                      key={day}
                      className={`h-12 flex items-center justify-center text-sm sm:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                        day === birthDate.day
                          ? 'text-yellow-400 font-medium'
                          : 'text-gray-500'
                      }`}
                      onClick={() => {
                        const newDate = { ...birthDate, day }
                        setBirthDate(newDate)
                        setDateOfBirth(convertToISODate(newDate))
                        scrollToDateCenter(dayRef, day - 1)
                        // Sync state after scroll
                        setTimeout(() => handleDateScroll('day'), 100)
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {day}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>

            {/* Month Column */}
            <div className="flex-[2] min-w-0 relative">
              <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Month</div>
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
              <div
                ref={monthRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleDateScroll('month')}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => {
                  const transform = getDate3DTransform(index, monthRef, 48, 96, 240)
                  return (
                    <div
                      key={month}
                      className={`h-12 flex items-center justify-center text-xs sm:text-base md:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                        index + 1 === birthDate.month
                          ? 'text-yellow-400 font-medium'
                          : 'text-gray-500'
                      }`}
                      onClick={() => {
                        const newDate = { ...birthDate, month: index + 1 }
                        setBirthDate(newDate)
                        setDateOfBirth(convertToISODate(newDate))
                        scrollToDateCenter(monthRef, index)
                        // Sync state after scroll
                        setTimeout(() => handleDateScroll('month'), 100)
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {month}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>

            {/* Year Column */}
            <div className="flex-1 min-w-0 relative">
              <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Year</div>
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
              <div
                ref={yearRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleDateScroll('year')}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year, index) => {
                  const transform = getDate3DTransform(index, yearRef, 48, 96, 240)
                  return (
                    <div
                      key={year}
                      className={`h-12 flex items-center justify-center text-sm sm:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                        year === birthDate.year
                          ? 'text-yellow-400 font-medium'
                          : 'text-gray-500'
                      }`}
                      onClick={() => {
                        const newDate = { ...birthDate, year }
                        setBirthDate(newDate)
                        setDateOfBirth(convertToISODate(newDate))
                        scrollToDateCenter(yearRef, index)
                        // Sync state after scroll
                        setTimeout(() => handleDateScroll('year'), 100)
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {year}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <motion.button
              onClick={() => handleStepChange(1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 px-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 rounded-2xl font-medium text-gray-300 transition-all duration-300"
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => handleStepChange(3)}
              disabled={!dateOfBirth}
              whileHover={{ scale: dateOfBirth ? 1.02 : 1 }}
              whileTap={{ scale: dateOfBirth ? 0.98 : 1 }}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
                dateOfBirth
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40'
                  : 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Enter your birth time',
      subtitle: 'For more accurate predictions',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!unknownBirthTime && (
            <div className="flex gap-1 sm:gap-2">
              {/* Hour Column */}
              <div className="flex-1 min-w-0 relative">
                <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Hour</div>
                <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
                <div
                  ref={hourRef}
                  className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                  onScroll={() => handleTimeScroll('hour')}
                  style={{ 
                    scrollBehavior: 'smooth',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="h-24" />
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour, index) => {
                    const transform = getTime3DTransform(index, hourRef, 48, 96, 240)
                    return (
                      <div
                        key={hour}
                        className={`h-12 flex items-center justify-center text-sm sm:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                          hour === timeValue.hour
                            ? 'text-yellow-400 font-medium'
                            : 'text-gray-500'
                        }`}
                        onClick={() => {
                          const newTime = { ...timeValue, hour }
                          setTimeValue(newTime)
                          setBirthTime(convertTo24Hour(newTime))
                          scrollToTimeCenter(hourRef, index)
                          // Sync state after scroll
                          setTimeout(() => handleTimeScroll('hour'), 100)
                        }}
                        style={{
                          ...transform,
                          transformOrigin: 'center center',
                          willChange: 'transform, opacity'
                        }}
                      >
                        {hour.toString().padStart(2, '0')}
                      </div>
                    )
                  })}
                  <div className="h-24" />
                </div>
              </div>

              {/* Minute Column */}
              <div className="flex-1 min-w-0 relative">
                <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Minute</div>
                <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
                <div
                  ref={minuteRef}
                  className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                  onScroll={() => handleTimeScroll('minute')}
                  style={{ 
                    scrollBehavior: 'smooth',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="h-24" />
                  {Array.from({ length: 60 }, (_, i) => i).map((minute, index) => {
                    const transform = getTime3DTransform(index, minuteRef, 48, 96, 240)
                    return (
                      <div
                        key={minute}
                        className={`h-12 flex items-center justify-center text-sm sm:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                          minute === timeValue.minute
                            ? 'text-yellow-400 font-medium'
                            : 'text-gray-500'
                        }`}
                        onClick={() => {
                          const newTime = { ...timeValue, minute }
                          setTimeValue(newTime)
                          setBirthTime(convertTo24Hour(newTime))
                          scrollToTimeCenter(minuteRef, index)
                          // Sync state after scroll
                          setTimeout(() => handleTimeScroll('minute'), 100)
                        }}
                        style={{
                          ...transform,
                          transformOrigin: 'center center',
                          willChange: 'transform, opacity'
                        }}
                      >
                        {minute.toString().padStart(2, '0')}
                      </div>
                    )
                  })}
                  <div className="h-24" />
                </div>
              </div>

              {/* Period Column */}
              <div className="flex-1 min-w-0 relative">
                <div className="text-center text-xs font-light text-gray-500 mb-4 tracking-wider uppercase">Period</div>
                <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-gradient-to-b from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-y border-yellow-500/40 pointer-events-none z-10 rounded-lg" />
                <div
                  ref={periodRef}
                  className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                  onScroll={() => handleTimeScroll('period')}
                  style={{ 
                    scrollBehavior: 'smooth',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="h-24" />
                  {['AM', 'PM'].map((period, index) => {
                    const transform = getTime3DTransform(index, periodRef, 48, 96, 240)
                    return (
                      <div
                        key={period}
                        className={`h-12 flex items-center justify-center text-sm sm:text-lg font-light snap-center cursor-pointer transition-all relative z-10 ${
                          period === timeValue.period
                            ? 'text-yellow-400 font-medium'
                            : 'text-gray-500'
                        }`}
                        onClick={() => {
                          const newTime = { ...timeValue, period: period as 'AM' | 'PM' }
                          setTimeValue(newTime)
                          setBirthTime(convertTo24Hour(newTime))
                          scrollToTimeCenter(periodRef, index)
                          // Sync state after scroll
                          setTimeout(() => handleTimeScroll('period'), 100)
                        }}
                        style={{
                          ...transform,
                          transformOrigin: 'center center',
                          willChange: 'transform, opacity'
                        }}
                      >
                        {period}
                      </div>
                    )
                  })}
                  <div className="h-24" />
                </div>
              </div>
            </div>
          )}

          <label className="flex items-start gap-4 cursor-pointer group pt-2">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={unknownBirthTime}
                onChange={(e) => {
                  setUnknownBirthTime(e.target.checked)
                  if (e.target.checked) {
                    setBirthTime('')
                  }
                }}
                className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800/40 text-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all duration-300 appearance-none checked:bg-yellow-500/20 checked:border-yellow-500"
              />
              {unknownBirthTime && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 left-0 w-5 h-5 text-yellow-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </div>
            <div>
              <p className="text-gray-300 font-medium group-hover:text-yellow-400 transition-colors duration-300">
                Don't know my exact time of birth
              </p>
              <p className="text-sm text-gray-500 mt-1 font-light">
                Note: Without time of birth, we can still achieve upto 80% accurate predictions
              </p>
            </div>
          </label>

          <div className="flex gap-4 pt-6">
            <motion.button
              onClick={() => handleStepChange(2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 px-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 rounded-2xl font-medium text-gray-300 transition-all duration-300"
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => handleStepChange(4)}
              disabled={!birthTime && !unknownBirthTime}
              whileHover={{ scale: (birthTime || unknownBirthTime) ? 1.02 : 1 }}
              whileTap={{ scale: (birthTime || unknownBirthTime) ? 0.98 : 1 }}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
                (birthTime || unknownBirthTime)
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40'
                  : 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Select your gender',
      subtitle: 'Helps us personalize your reading',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            {[
              { value: 'male', label: 'Male', icon: '👨' },
              { value: 'female', label: 'Female', icon: '👩' },
              { value: 'other', label: 'Other', icon: '✨' },
            ].map((g, index) => (
              <motion.button
                key={g.value}
                onClick={() => setGender(g.value as any)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full group relative overflow-hidden ${
                  gender === g.value
                    ? 'bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20'
                    : 'bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60'
                } backdrop-blur-sm rounded-2xl p-5 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{g.icon}</span>
                    <span className={`text-lg font-medium tracking-wide ${
                      gender === g.value ? 'text-yellow-400' : 'text-gray-300 group-hover:text-white'
                    } transition-colors duration-300`}>
                      {g.label}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    gender === g.value
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}>
                    {gender === g.value && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="flex gap-4 pt-6">
            <motion.button
              onClick={() => handleStepChange(3)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 px-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 rounded-2xl font-medium text-gray-300 transition-all duration-300"
            >
              Back
            </motion.button>
            <motion.button
              onClick={handleComplete}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
                !isLoading
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40'
                  : 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse delay-150"></span>
                </span>
              ) : (
                'Continue'
              )}
            </motion.button>
          </div>
        </motion.div>
      ),
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen min-h-[100dvh] p-2 sm:p-4 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-16 shadow-2xl border border-slate-700/30 mx-auto w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent text-center sm:text-left tracking-tight">
                {steps[step].title}
              </h1>
              <p className="text-gray-400 mb-10 sm:mb-12 text-sm sm:text-base text-center sm:text-left font-light tracking-wide leading-relaxed">{steps[step].subtitle}</p>
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-12 justify-center flex-wrap">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === step
                    ? 'w-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
                    : index < step
                    ? 'w-2 bg-yellow-400/40'
                    : 'w-2 bg-slate-700/30'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4 font-light tracking-wider uppercase">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        /* Hide scrollbar for all picker columns */
        [class*="overflow-y-scroll"]::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
        }
        [class*="overflow-y-scroll"] {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  )
}

