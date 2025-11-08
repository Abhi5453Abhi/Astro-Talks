'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { setPaidUser } = useStore()

  const handlePurchase = async (tier: string) => {
    // In production, integrate with Stripe
    // For demo purposes, we'll simulate the purchase
    
    alert(`Processing payment for ${tier} tier...\n\nIn production, this would integrate with Stripe for secure payment processing.`)
    
    // Simulate successful payment
    setPaidUser(true)
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess()
    }
    
    onClose()
  }

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-effect rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-white/20"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl mystic-glow">
                    ✨
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-gradient mb-2">
                  Unlock Your Cosmic Destiny
                </h2>
                <p className="text-gray-400 text-lg">
                  Choose your spiritual journey with Astrologer
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Single Reading */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl mb-3">🌙</div>
                  <h3 className="text-xl font-bold mb-2">Single Reading</h3>
                  <div className="text-3xl font-bold text-gradient mb-4">$9.99</div>
                  <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                    <li>✓ One detailed topic reading</li>
                    <li>✓ Love, Career, or Life Path</li>
                    <li>✓ Personalized insights</li>
                    <li>✓ Spiritual guidance</li>
                  </ul>
                  <button
                    onClick={() => handlePurchase('Single Reading')}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all"
                  >
                    Get Reading
                  </button>
                </motion.div>

                {/* Monthly */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500 rounded-2xl p-6 text-center relative"
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="text-4xl mb-3">⭐</div>
                  <h3 className="text-xl font-bold mb-2">Monthly Access</h3>
                  <div className="text-3xl font-bold text-gradient mb-4">$29.99</div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-6 text-left">
                    <li>✓ Unlimited chat sessions</li>
                    <li>✓ All topics covered</li>
                    <li>✓ Daily cosmic insights</li>
                    <li>✓ Priority responses</li>
                    <li>✓ Karma cleansing rituals</li>
                  </ul>
                  <button
                    onClick={() => handlePurchase('Monthly')}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all mystic-glow"
                  >
                    Start Journey
                  </button>
                </motion.div>

                {/* Lifetime */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 border border-amber-500/30 rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl mb-3">👑</div>
                  <h3 className="text-xl font-bold mb-2">Lifetime Wisdom</h3>
                  <div className="text-3xl font-bold text-gradient mb-4">$99.99</div>
                  <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                    <li>✓ Everything in Monthly</li>
                    <li>✓ Lifetime access</li>
                    <li>✓ Personal birth chart</li>
                    <li>✓ Yearly forecasts</li>
                    <li>✓ Exclusive ceremonies</li>
                  </ul>
                  <button
                    onClick={() => handlePurchase('Lifetime')}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-semibold transition-all"
                  >
                    Embrace Destiny
                  </button>
                </motion.div>
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Maybe later
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>🔒 Secure payment via Stripe • Cancel anytime • Money-back guarantee</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

