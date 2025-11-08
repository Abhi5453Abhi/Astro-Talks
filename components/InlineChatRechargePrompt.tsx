'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface InlineChatRechargePromptProps {
  onProceedToPay: (selectedAmounts: number[]) => void
}

interface RechargeOption {
  amount: number
  extra: string
}

const rechargeOptions: RechargeOption[] = [
  { amount: 200, extra: '100% EXTRA' },
  { amount: 500, extra: '40% EXTRA' },
  { amount: 1000, extra: '20% EXTRA' },
  { amount: 3000, extra: '10% EXTRA' },
  { amount: 4000, extra: '12% EXTRA' },
  { amount: 8000, extra: '12% EXTRA' },
  { amount: 2000, extra: '10% EXTRA' },
  { amount: 15000, extra: '16% EXTRA' },
]

export default function InlineChatRechargePrompt({ onProceedToPay }: InlineChatRechargePromptProps) {
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([])

  const toggleAmount = (amount: number) => {
    if (selectedAmounts.includes(amount)) {
      setSelectedAmounts(selectedAmounts.filter(a => a !== amount))
    } else {
      setSelectedAmounts([...selectedAmounts, amount])
    }
  }

  const handleProceedToPay = () => {
    if (selectedAmounts.length > 0) {
      onProceedToPay(selectedAmounts)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md my-4"
    >
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-5 border border-amber-200 shadow-lg">
        {/* Warning Message */}
        <div className="mb-4 text-center">
          <p className="text-red-500 font-medium text-sm mb-2">
            Minimum balance of 10 minutes (₹ 200) is required to start chat with Yaksh
          </p>
          <h3 className="text-gray-900 font-bold text-lg mb-2">Recharge Now</h3>
          <div className="flex items-start gap-1 justify-center text-xs text-gray-600">
            <span className="text-yellow-500 text-sm">💡</span>
            <p>
              <span className="font-semibold">Tip:</span> 90% users recharge for 10 mins or more.
            </p>
          </div>
        </div>

        {/* Recharge Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {rechargeOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => toggleAmount(option.amount)}
              className={`relative bg-white rounded-2xl p-4 border-2 transition-all ${
                selectedAmounts.includes(option.amount)
                  ? 'border-yellow-400 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Green Extra Badge */}
              <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm transform -rotate-12">
                {option.extra}
              </div>
              
              {/* Amount */}
              <div className="text-gray-900 font-bold text-xl pt-2">
                ₹ {option.amount.toLocaleString('en-IN')}
              </div>
              
              {/* Selection indicator */}
              {selectedAmounts.includes(option.amount) && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Proceed to Pay Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleProceedToPay}
          disabled={selectedAmounts.length === 0}
          className="w-full py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Pay
          {selectedAmounts.length > 0 && (
            <span className="ml-2">
              (₹{selectedAmounts.reduce((a, b) => a + b, 0).toLocaleString('en-IN')})
            </span>
          )}
        </motion.button>

        {/* Additional Info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure payment • ₹20/min • Instant activation
          </p>
        </div>
      </div>
    </motion.div>
  )
}

