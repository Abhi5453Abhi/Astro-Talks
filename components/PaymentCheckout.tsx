'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentCheckoutProps {
  isOpen: boolean
  amount: number
  extraPercent: number
  onClose: () => void
  onPaymentSuccess: () => void
}

export default function PaymentCheckout({ 
  isOpen, 
  amount, 
  extraPercent, 
  onClose,
  onPaymentSuccess 
}: PaymentCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const gstPercent = 18.0
  const gstAmount = (amount * gstPercent) / 100
  const totalAmount = amount + gstAmount
  const extraAmount = (amount * extraPercent) / 100

  const handlePayment = () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess()
      onClose()
    }, 2000)
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
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
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment
                </h2>
                <div className="w-8" />
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Amount Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Recharge Amount</span>
                    <span className="text-gray-900 font-semibold">₹{amount.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">GST({gstPercent}%)</span>
                    <span className="text-gray-900 font-semibold">₹{gstAmount.toFixed(1)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold">Total Recharge Amount</span>
                      <span className="text-gray-900 font-bold">₹{totalAmount.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                    <span>✓</span>
                    <span className="font-medium">100% Safe and Secure</span>
                  </div>
                </div>

                {/* Coupon Applied */}
                {extraPercent > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-green-700 font-bold mb-1">ASTROOFFER{extraPercent} applied</p>
                        <p className="text-green-600 text-sm flex items-start gap-1">
                          <span>✓</span>
                          <span>₹{extraAmount.toFixed(0)} extra in Astrotalk wallet with this recharge</span>
                        </p>
                      </div>
                      <button className="text-gray-400 text-sm hover:text-gray-600">
                        REMOVE
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="mb-4">
                  <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <span>📱</span>
                    Pay via UPI
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={() => setSelectedPaymentMethod('phonepe')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === 'phonepe'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold">
                        Pe
                      </div>
                      <span className="text-xs text-gray-700">PhonePe</span>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('paytm')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === 'paytm'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        Paytm
                      </div>
                      <span className="text-xs text-gray-700">Paytm</span>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('cred')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === 'cred'
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        CRED
                      </div>
                      <span className="text-xs text-gray-700">CRED UPI</span>
                    </button>
                  </div>
                </div>

                {/* Other Payment Methods */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedPaymentMethod('other-upi')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'other-upi'
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <span className="text-gray-700 font-medium">Pay with other UPI apps</span>
                    </div>
                    <span className="text-gray-400">›</span>
                  </button>

                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-gray-600 text-sm font-medium mb-3">Others</h4>
                    
                    <button
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all mb-2 ${
                        selectedPaymentMethod === 'upi'
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">UPI</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all mb-2 ${
                        selectedPaymentMethod === 'card'
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💳</span>
                        <span className="text-sm text-gray-700">Credit/Debit Card</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('netbanking')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all mb-2 ${
                        selectedPaymentMethod === 'netbanking'
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏦</span>
                        <span className="text-sm text-gray-700">Net Banking</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('wallets')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedPaymentMethod === 'wallets'
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">👛</span>
                        <div className="text-left">
                          <p className="text-sm text-gray-700">Other Wallets</p>
                          <p className="text-xs text-gray-500">Freecharge, Payzapp & more</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Proceed to pay`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

