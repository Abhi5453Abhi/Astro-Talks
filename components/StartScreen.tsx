'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
// Google sign-in feature commented out
// import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function StartScreen() {
  const { setCurrentScreen } = useStore()
  const { status } = useSession()
  const [showSignIn, setShowSignIn] = useState(false)

  const handleStartNow = () => {
    // Navigate to onboarding screen to collect user details
    setCurrentScreen('onboarding')
  }

  useEffect(() => {
    if (status === 'authenticated') {
      setCurrentScreen('onboarding')
    }
  }, [status, setCurrentScreen])

  return (
    <div className="min-h-screen min-h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Night Sky Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background-night-sky.mp4" type="video/mp4" />
          <source src="/background-night-sky.webm" type="video/webm" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center text-center gap-8">
        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-6xl sm:text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
        >
          Astronova
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-amber-100/90 text-lg sm:text-xl font-light tracking-wide"
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
            className="group relative bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 font-bold text-lg sm:text-xl px-16 sm:px-20 py-4 sm:py-5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] transition-all duration-300 mt-6 tracking-wider border border-amber-200/50"
          >
            <span className="relative z-10">Start Now</span>
            <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <p className="text-amber-100/80 text-sm sm:text-base font-light tracking-wide">Trusted by 2 lakh+ families</p>
            <p className="text-amber-100/80 text-sm sm:text-base font-light tracking-wide">24/7 Pandit Consultation</p>
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

