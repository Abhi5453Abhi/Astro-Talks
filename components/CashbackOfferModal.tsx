'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CashbackOfferModalProps {
  isOpen: boolean
  onRecharge: () => void
  onClose: () => void
}

export default function CashbackOfferModal({ isOpen, onRecharge, onClose }: CashbackOfferModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>

              {/* Cashback Badge */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="relative inline-block"
                >
                  {/* Decorative elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-3 -left-3 text-yellow-400 text-2xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-2 -right-2 text-yellow-400 text-xl"
                  >
                    ✨
                  </motion.div>
                  
                  <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl px-8 py-4 shadow-xl transform rotate-[-2deg]">
                    <div className="text-white font-black text-5xl mb-1">
                      100%
                    </div>
                    <div className="bg-green-600 text-white font-bold text-lg px-4 py-1 rounded-lg">
                      CASHBACK
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Offer Text */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Enjoyed your free session?
                </h2>
                <p className="text-gray-700 font-semibold text-lg mb-2">
                  Get <span className="text-green-600 font-bold">₹100</span> extra on{' '}
                  <span className="text-green-600 font-bold">₹100</span> recharge
                </p>
                <p className="text-sm text-gray-500">
                  Limited time offer - Valid for 4 hours
                </p>
              </div>

              {/* Recharge Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRecharge}
                className="w-full py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Recharge now
              </motion.button>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure payment • ₹20/min • Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

