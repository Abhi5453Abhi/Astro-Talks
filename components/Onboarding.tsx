'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { getZodiacSign } from '@/lib/utils'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [languages, setLanguages] = useState<('english' | 'hindi' | 'punjabi')[]>([])
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [unknownBirthTime, setUnknownBirthTime] = useState(false)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [isLoading, setIsLoading] = useState(false)

  const { setUserProfile } = useStore()

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

    setUserProfile({
      name,
      dateOfBirth,
      birthTime: unknownBirthTime ? undefined : birthTime,
      gender,
      languages,
      zodiacSign,
    })
    
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
          className="space-y-4"
        >
          <p className="text-center text-gray-600 mb-4">Select all languages you're comfortable with</p>
          {[
            { value: 'english', label: 'English' },
            { value: 'hindi', label: 'हिंदी (Hindi)' },
            { value: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => toggleLanguage(lang.value as any)}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${
                languages.includes(lang.value as any)
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 shadow-lg'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{languages.includes(lang.value as any) ? '✓' : '○'}</span>
              <span>{lang.label}</span>
            </button>
          ))}
          <button
            onClick={() => handleStepChange(1)}
            disabled={languages.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 shadow-lg"
          >
            Continue
          </button>
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
          className="space-y-6"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-lg"
            autoFocus
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleStepChange(0)}
              className="flex-1 py-4 px-6 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => handleStepChange(2)}
              disabled={!name.trim()}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              Continue
            </button>
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
          <div className="space-y-2">
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-lg cursor-pointer"
              autoFocus
              placeholder="Select your birth date"
            />
            {dateOfBirth && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-amber-600 px-2"
              >
                ✨ {new Date(dateOfBirth).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>
            )}
          </div>
                 <div className="flex gap-4">
                   <button
                     onClick={() => handleStepChange(1)}
                     className="flex-1 py-4 px-6 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-all"
                   >
                     Back
                   </button>
                   <button
                     onClick={() => handleStepChange(3)}
                     disabled={!dateOfBirth}
                     className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                   >
                     Continue
                   </button>
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
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={unknownBirthTime}
            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-lg disabled:opacity-50 disabled:bg-gray-100"
            autoFocus
          />
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={unknownBirthTime}
              onChange={(e) => {
                setUnknownBirthTime(e.target.checked)
                if (e.target.checked) setBirthTime('')
              }}
              className="mt-1 w-5 h-5 rounded border-gray-300 bg-gray-50 text-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <div>
              <p className="text-gray-900 font-medium group-hover:text-amber-600 transition-colors">
                Don't know my exact time of birth
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Note: Without time of birth, we can still achieve upto 80% accurate predictions
              </p>
            </div>
          </label>
                 <div className="flex gap-4">
                   <button
                     onClick={() => handleStepChange(2)}
                     className="flex-1 py-4 px-6 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-all"
                   >
                     Back
                   </button>
                   <button
                     onClick={() => handleStepChange(4)}
                     disabled={!birthTime && !unknownBirthTime}
                     className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                   >
                     Continue
                   </button>
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
          {[
            { value: 'male', label: 'Male', icon: '👨' },
            { value: 'female', label: 'Female', icon: '👩' },
            { value: 'other', label: 'Other', icon: '✨' },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value as any)}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${
                gender === g.value
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 shadow-lg'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleStepChange(3)}
              className="flex-1 py-4 px-6 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
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
            </button>
          </div>
        </motion.div>
      ),
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-amber-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                {steps[step].title}
              </h1>
              <p className="text-gray-600 mb-8 text-lg">{steps[step].subtitle}</p>
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-8 justify-center flex-wrap">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? 'w-8 bg-gradient-to-r from-amber-400 to-amber-500'
                    : index < step
                    ? 'w-2 bg-amber-400/50'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

