'use client'

import { motion } from 'framer-motion'

interface ContinueChatBannerProps {
  userName: string
  onContinueChat: () => void
}

export default function ContinueChatBanner({ userName, onContinueChat }: ContinueChatBannerProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-br from-slate-50 to-purple-50"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 rounded-2xl p-4 shadow-lg border-2 border-yellow-400">
          <div className="flex items-center gap-3 mb-3">
            {/* Astrologer Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
              ✨
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <p className="text-gray-900 font-semibold text-sm">
                Hi {userName}, lets continue this chat at price of ₹20.0/min
              </p>
            </div>
          </div>
          
          {/* Continue Chat Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onContinueChat}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-gray-900 rounded-xl font-bold text-base transition-all shadow-md"
          >
            Continue Chat
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

