'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import PaymentCheckout from './PaymentCheckout'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface RechargeOption {
  amount: number
  extraPercent: number
  isPopular?: boolean
}

const rechargeOptions: RechargeOption[] = [
  { amount: 100, extraPercent: 100 },
  { amount: 200, extraPercent: 100 },
  { amount: 500, extraPercent: 40, isPopular: true },
  { amount: 1000, extraPercent: 20 },
  { amount: 2000, extraPercent: 10 },
  { amount: 3000, extraPercent: 10 },
  { amount: 4000, extraPercent: 12 },
  { amount: 8000, extraPercent: 12 },
  { amount: 15000, extraPercent: 16 },
  { amount: 20000, extraPercent: 16 },
  { amount: 50000, extraPercent: 20 },
  { amount: 100000, extraPercent: 20 },
]

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { setPaidUser, walletBalance, setWalletBalance } = useStore()
  const [selectedOption, setSelectedOption] = useState<RechargeOption | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const handleRecharge = async (option: RechargeOption) => {
    setSelectedOption(option)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = (walletCreditAmount?: number) => {
    if (!selectedOption) return
    
    // Use verified amount from payment or calculate from selected option
    const extraAmount = (selectedOption.amount * selectedOption.extraPercent) / 100
    const totalWalletCredit = walletCreditAmount !== undefined 
      ? walletCreditAmount 
      : selectedOption.amount + extraAmount
    
    // Update wallet balance with verified amount
    setWalletBalance(walletBalance + totalWalletCredit)
    
    // Mark as paid user
    setPaidUser(true)
    
    // Call success callback
    if (onSuccess) {
      onSuccess()
    }
    
    setSelectedOption(null)
    setShowCheckout(false)
    onClose()
  }

  const handleCheckoutClose = () => {
    setShowCheckout(false)
    setSelectedOption(null)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && !showCheckout && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add money to wallet
                </h2>
                <div className="w-8" /> {/* Spacer for alignment */}
              </div>

              {/* Recharge Options Grid */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-3 gap-3">
                  {rechargeOptions.map((option) => (
                    <motion.button
                      key={option.amount}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRecharge(option)}
                      className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-green-400 hover:shadow-md transition-all"
                    >
                      {/* Most Popular Badge */}
                      {option.isPopular && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      {/* Amount */}
                      <div className="text-gray-900 font-bold text-lg mb-2">
                        ₹ {option.amount.toLocaleString('en-IN')}
                      </div>
                      
                      {/* Extra Percentage */}
                      <div className="text-green-500 font-semibold text-sm">
                        {option.extraPercent}% Extra
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
                  <p>🔒 Secure payment gateway</p>
                  <p>💳 All payment methods accepted</p>
                  <p>⚡ Instant wallet credit</p>
                </div>
              </div>
            </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Checkout Screen */}
      {selectedOption && (
        <PaymentCheckout
          isOpen={showCheckout}
          amount={selectedOption.amount}
          extraPercent={selectedOption.extraPercent}
          onClose={handleCheckoutClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

