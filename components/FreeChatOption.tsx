'use client'

import { motion } from 'framer-motion'

interface FreeChatOptionProps {
  onStartFreeChat: () => void
  onSkip: () => void
}

export default function FreeChatOption({ onStartFreeChat, onSkip }: FreeChatOptionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-amber-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-2xl"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-5xl shadow-lg"
        >
          ✨
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Welcome, Seeker
        </h1>

        {/* Description */}
        <div className="text-center mb-8 space-y-3">
          <p className="text-gray-600 text-lg">
            Your cosmic profile is ready
          </p>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-sm mb-2">
              🎁 <span className="font-semibold">Special Offer</span>
            </p>
            <p className="text-gray-900 font-bold text-xl">
              2 Minutes Free Chat
            </p>
            <p className="text-gray-600 text-sm mt-1">
              with Astrologer
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartFreeChat}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl font-semibold text-lg text-gray-900 transition-all shadow-lg"
          >
            Start Free Chat ⏱️
          </motion.button>

          <button
            onClick={onSkip}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Skip for now
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          No payment required • Cancel anytime
        </p>
      </motion.div>
    </div>
  )
}

