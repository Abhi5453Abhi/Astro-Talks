'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

interface ContinueChatCardProps {
  onContinue: () => void
  onRecharge: () => void
}

export default function ContinueChatCard({ onContinue, onRecharge }: ContinueChatCardProps) {
  const { walletBalance } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md my-4"
    >
      {/* Balance Display */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-sm text-gray-600">💰 Available Balance -</span>
        <span className="text-sm font-bold text-gray-900">₹{walletBalance}</span>
      </div>

      {/* Astrologer Card */}
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4 mb-3 border border-amber-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl shadow-md">
            ✨
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">Astrologer</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-amber-600">⭐</span>
              <span className="text-xs text-gray-700 font-medium">5.0</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-700 text-center">
          Click continue chat to reconnect with astrologer.
        </p>
      </div>

      {/* Continue Chat Button */}
      <button
        onClick={onContinue}
        className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-2"
      >
        Continue Chat
      </button>

      {/* Recharge Link */}
      <button
        onClick={onRecharge}
        className="w-full py-2 text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors"
      >
        💳 Recharge Wallet
      </button>

      {/* Note */}
      <p className="text-center text-xs text-gray-500 mt-3">
        ₹20/min • Secure payment • Cancel anytime
      </p>
    </motion.div>
  )
}

