'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PaymentSuccessModal from './PaymentSuccessModal'

interface PaymentCheckoutProps {
  isOpen: boolean
  amount: number
  extraPercent: number
  onClose: () => void
  onPaymentSuccess: () => void
}

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
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
  const [showCardForm, setShowCardForm] = useState(false)
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const gstPercent = 18.0
  const gstAmount = (amount * gstPercent) / 100
  const totalAmount = amount + gstAmount
  const extraAmount = (amount * extraPercent) / 100

  const handleSuccess = () => {
    setShowSuccessModal(true)
    setIsProcessing(false)
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    onPaymentSuccess()
    onClose()
  }

  // Handle UPI payment
  const handleUpiPayment = async (app: string) => {
    setIsProcessing(true)

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      setRazorpayOrderId(orderData.orderId)

      // Step 2: Initialize Razorpay with UPI intent configuration
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Astro Talks',
        description: `Wallet Recharge ₹${amount}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              handleSuccess()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            setIsProcessing(false)
            // Error handling - could add error toast here
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          recharge_amount: amount,
          extra_amount: extraAmount,
          total_wallet_credit: amount + extraAmount,
        },
        theme: {
          color: '#F59E0B',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent'],
                    apps: [app]
                  }
                ]
              }
            },
            hide: [
              { method: 'card' },
              { method: 'netbanking' },
              { method: 'wallet' }
            ],
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error)
        setIsProcessing(false)
        // Error handling - could add error toast here
      })
      
      razorpay.open()
    } catch (error: any) {
      console.error('UPI payment error:', error)
      setIsProcessing(false)
      // Error handling - could add error toast here
    }
  }

  // Handle card payment click
  const handleCardPaymentClick = async () => {
    setIsProcessing(true)

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      setRazorpayOrderId(orderData.orderId)
      setShowCardForm(true)
      setIsProcessing(false)
    } catch (error: any) {
      console.error('Card payment setup error:', error)
      setIsProcessing(false)
      // Error handling - could add error toast here
    }
  }

  // Handle card form submission using Razorpay's embedded form
  const handleCardFormSubmit = async () => {
    if (!razorpayOrderId) {
      // Error handling - could add error toast here
      return
    }

    setIsProcessing(true)

    try {
      // Use Razorpay's standard checkout for card payments
      // This is the easiest and most PCI compliant way
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Astro Talks',
        description: `Wallet Recharge ₹${amount}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              handleSuccess()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            setIsProcessing(false)
            // Error handling - could add error toast here
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          recharge_amount: amount,
          extra_amount: extraAmount,
          total_wallet_credit: amount + extraAmount,
        },
        theme: {
          color: '#F59E0B',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            setShowCardForm(false)
          },
        },
        config: {
          display: {
            blocks: {
              card: {
                name: 'Pay with Card',
                instruments: [
                  { method: 'card' }
                ]
              }
            },
            sequence: ['block.card'],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error)
        setIsProcessing(false)
        // Error handling - could add error toast here
      })
      
      razorpay.open()
    } catch (error: any) {
      console.error('Card payment error:', error)
      setIsProcessing(false)
      // Error handling - could add error toast here
    }
  }

  // Handle back from card form
  const handleBackFromCardForm = () => {
    setShowCardForm(false)
    setRazorpayOrderId('')
    setSelectedPaymentMethod('')
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
                  onClick={showCardForm ? handleBackFromCardForm : onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {showCardForm ? 'Card Payment' : 'Payment'}
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

                {/* Card Form View */}
                {showCardForm ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-blue-700 text-sm">
                        🔒 Your card details are securely handled by Razorpay. We never store your card information.
                      </p>
                    </div>
                    <div className="min-h-[200px]">
                      <p className="text-gray-600 text-sm text-center py-8">
                        Click "Pay with Card" below to enter your card details securely.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Payment Methods Selection */}
                    <div className="mb-4">
                      <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                        <span>📱</span>
                        Pay via UPI
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <button
                          onClick={() => handleUpiPayment('phonepe')}
                          disabled={isProcessing}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                            selectedPaymentMethod === 'phonepe'
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            Pe
                          </div>
                          <span className="text-xs text-gray-700">PhonePe</span>
                        </button>

                        <button
                          onClick={() => handleUpiPayment('paytm')}
                          disabled={isProcessing}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                            selectedPaymentMethod === 'paytm'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                            Paytm
                          </div>
                          <span className="text-xs text-gray-700">Paytm</span>
                        </button>

                        <button
                          onClick={() => handleUpiPayment('gpay')}
                          disabled={isProcessing}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                            selectedPaymentMethod === 'gpay'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">
                            G
                          </div>
                          <span className="text-xs text-gray-700">GPay</span>
                        </button>
                      </div>
                    </div>

                    {/* Other Payment Methods */}
                    <div className="space-y-3">
                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-gray-600 text-sm font-medium mb-3">Other Methods</h4>
                        
                        <button
                          onClick={handleCardPaymentClick}
                          disabled={isProcessing}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all mb-2 disabled:opacity-50 ${
                            selectedPaymentMethod === 'card'
                              ? 'border-amber-400 bg-amber-50'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💳</span>
                            <span className="text-sm text-gray-700 font-medium">Credit/Debit Card</span>
                          </div>
                          <span className="text-gray-400">›</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                {showCardForm ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCardFormSubmit}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay with Card ₹${totalAmount.toLocaleString('en-IN')}`
                    )}
                  </motion.button>
                ) : (
                  <div className="text-center">
                    {isProcessing && (
                      <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                        <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Processing payment...</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Select a payment method above to continue
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        amount={amount}
        extraAmount={extraAmount}
        onClose={handleSuccessModalClose}
      />
    </AnimatePresence>
  )
}

