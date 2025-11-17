'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface PaymentSuccessModalProps {
  isOpen: boolean
  amount: number
  extraAmount: number
  onClose: () => void
}

export default function PaymentSuccessModal({
  isOpen,
  amount,
  extraAmount,
  onClose,
}: PaymentSuccessModalProps) {
  // Auto close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  const totalCredit = amount + extraAmount

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Success Icon */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
                >
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 text-sm">
                  Your wallet has been recharged
                </p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm font-medium">
                      Recharge Amount
                    </span>
                    <span className="text-gray-900 font-bold text-lg">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {extraAmount > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-600 text-sm font-medium">
                        Bonus Credit
                      </span>
                      <span className="text-green-600 font-bold">
                        +₹{extraAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold">
                        Total Wallet Balance
                      </span>
                      <span className="text-amber-600 font-bold text-xl">
                        ₹{totalCredit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span className="font-medium">
                    Transaction secured by Razorpay
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="px-6 pb-6">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-xl font-bold transition-all shadow-md"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}


