'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface FreeChatOptionProps {
  onStartFreeChat: () => void
  onSkip: () => void
}

export default function FreeChatOption({ onStartFreeChat, onSkip }: FreeChatOptionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Night Sky Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background-night-sky.png"
          alt="Night Sky Background"
          fill
          className="object-cover"
          priority
          quality={90}
          unoptimized
        />
        {/* Overlay for better content readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full border border-slate-700/50 shadow-2xl relative z-10"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-5xl shadow-lg"
        >
          ✨
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Welcome, Seeker
        </h1>

        {/* Description */}
        <div className="text-center mb-8 space-y-3">
          <p className="text-gray-300 text-lg">
            Your cosmic profile is ready
          </p>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm mb-2">
              🎁 <span className="font-semibold">Special Offer</span>
            </p>
            <p className="text-white font-bold text-xl">
              2 Minutes Free Chat
            </p>
            <p className="text-gray-300 text-sm mt-1">
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
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-xl font-bold text-lg text-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] border border-amber-400/20"
          >
            Start Free Chat ⏱️
          </motion.button>

          <button
            onClick={onSkip}
            className="w-full py-3 px-6 text-gray-400 hover:text-gray-300 transition-colors text-sm"
          >
            Skip for now
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          No payment required • Cancel anytime
        </p>
      </motion.div>
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

