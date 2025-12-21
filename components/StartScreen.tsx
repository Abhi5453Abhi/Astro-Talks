'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
// Google sign-in feature commented out
// import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function StartScreen() {
  const { setCurrentScreen } = useStore()
  // Authentication feature commented out
  // const { status } = useSession()
  // const [showSignIn, setShowSignIn] = useState(false)

  const handleStartNow = () => {
    // Skip onboarding and go directly to free chat option screen
    setCurrentScreen('free-chat-option')
  }

  // Authentication feature commented out - no auth checks needed
  // useEffect(() => {
  //   if (status === 'authenticated') {
  //     setCurrentScreen('onboarding')
  //   }
  // }, [status, setCurrentScreen])

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Star background effect - subtle white dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              opacity: Math.random() * 0.4 + 0.1,
              animation: `twinkle ${Math.random() * 4 + 3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center text-center gap-8">
        {/* Logo - Golden Circle with Concentric Rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400"></div>
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-2 border-yellow-500"></div>
          {/* Inner solid circle */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight"
        >
          Astronova
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white text-lg sm:text-xl font-normal"
        >
          Your destiny, simplified.
        </motion.p>

        <AnimatePresence mode="wait">
          {/* Start Now Button */}
          <motion.button
            key="start-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartNow}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-lg sm:text-xl px-16 sm:px-20 py-4 sm:py-5 rounded-full shadow-lg hover:shadow-xl transition-all mt-4"
          >
            Start Now
          </motion.button>
          {/* Authentication feature commented out - sign-in flow removed */}
          {/* {!showSignIn ? (
            <motion.button
              key="start-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartNow}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-bold text-lg sm:text-xl px-12 sm:px-16 py-4 sm:py-5 rounded-full shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all"
            >
              Start Now
            </motion.button>
          ) : (
            <motion.div
              key="sign-in-disabled"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4 }}
              className="mt-4 text-white/70 text-sm"
            >
              Sign-in is currently disabled
            </motion.div>
          )} */}
          {/* Footer Text - Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="relative z-10 mt-12 sm:mt-16 text-center space-y-2"
          >
            <p className="text-white text-sm sm:text-base">Trusted by 2 lakh+ families.</p>
            <p className="text-white text-sm sm:text-base">24/7 Pandit Consultation</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
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

