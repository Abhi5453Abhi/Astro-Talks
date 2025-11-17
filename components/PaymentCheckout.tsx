'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PaymentSuccessModal from './PaymentSuccessModal'

interface PaymentCheckoutProps {
  isOpen: boolean
  amount: number
  extraPercent: number
  onClose: () => void
  onPaymentSuccess: () => void
}

// Extend Window interface to include Cashfree
declare global {
  interface Window {
    Cashfree: any
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
  const [cashfreeOrderId, setCashfreeOrderId] = useState<string>('')
  const [paymentSessionId, setPaymentSessionId] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false)
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const gstPercent = 18.0
  const gstAmount = (amount * gstPercent) / 100
  const totalAmount = amount + gstAmount
  const extraAmount = (amount * extraPercent) / 100

  // Load Cashfree SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !cashfreeLoaded) {
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      script.onload = () => {
        setCashfreeLoaded(true)
      }
      document.body.appendChild(script)

      return () => {
        // Cleanup script on unmount
        const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }
    }
  }, [cashfreeLoaded])

  const handleSuccess = () => {
    setShowSuccessModal(true)
    setIsProcessing(false)
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    onPaymentSuccess()
    onClose()
  }

  // Verify payment after successful checkout
  const verifyPayment = async (orderId: string) => {
    try {
      const verifyResponse = await fetch('/api/cashfree/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyResponse.ok && verifyData.success) {
        handleSuccess()
      } else {
        throw new Error(verifyData.error || 'Payment verification failed')
      }
    } catch (error: any) {
      console.error('Payment verification error:', error)
      setIsProcessing(false)
      alert('Payment verification failed. Please contact support.')
    }
  }

  // Check for payment success callback from Cashfree
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('payment')
      const orderId = urlParams.get('order_id')
      
      if (paymentStatus === 'success' && orderId) {
        // Verify and complete payment
        verifyPayment(orderId)
        // Clean up URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Initialize Cashfree checkout
  const initializeCashfreeCheckout = async (paymentMethod?: string) => {
    if (!cashfreeLoaded || !window.Cashfree) {
      // Wait a bit for SDK to load
      await new Promise(resolve => setTimeout(resolve, 500))
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded. Please refresh the page.')
      }
    }

    try {
      // Validate phone number before proceeding
      const phoneRegex = /^[6-9]\d{9}$/
      const cleanPhone = customerPhone.replace(/\D/g, '')
      
      if (!customerPhone || cleanPhone.length !== 10 || !phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid 10-digit mobile number')
        setIsProcessing(false)
        return
      }

      // Step 1: Create Cashfree order
      const orderResponse = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          customerPhone: cleanPhone,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Validate that we have a payment session ID
      if (!orderData.paymentSessionId) {
        console.error('Payment session ID missing from response:', orderData)
        throw new Error('Payment session ID not received. Please try again.')
      }

      console.log('Order created with payment session ID:', orderData.paymentSessionId)

      setCashfreeOrderId(orderData.orderId)
      setPaymentSessionId(orderData.paymentSessionId)

      // Step 2: Initialize Cashfree Checkout
      // Determine mode: sandbox mode uses test credentials, production uses live credentials
      // Cashfree test credentials typically don't start with 'CF' or contain 'test'
      // Use the mode from the API response if provided, otherwise detect from app ID
      const mode = orderData.mode || (
        process.env.NEXT_PUBLIC_CASHFREE_APP_ID && 
        !process.env.NEXT_PUBLIC_CASHFREE_APP_ID.includes('test') &&
        process.env.NEXT_PUBLIC_CASHFREE_APP_ID.startsWith('CF')
          ? 'production' 
          : 'sandbox'
      )
      
      console.log('Using Cashfree mode:', mode)
      
      const cashfree = window.Cashfree({
        mode: mode,
      })

      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_self',
      }

      console.log('Initializing Cashfree checkout with options:', checkoutOptions)
      console.log('Payment session ID length:', orderData.paymentSessionId?.length)

      // Open Cashfree checkout - this will redirect to payment page
      cashfree.checkout(checkoutOptions).catch((error: any) => {
        console.error('Cashfree checkout error:', error)
        setIsProcessing(false)
        alert('Failed to open payment gateway. Please try again.')
      })
      
      // Note: After payment, Cashfree will redirect back to the return_url
      // The payment verification will happen via URL parameters or webhook
    } catch (error: any) {
      console.error('Payment initialization error:', error)
      setIsProcessing(false)
      alert(error.message || 'Failed to initialize payment. Please try again.')
    }
  }

  // Handle UPI payment
  const handleUpiPayment = async (app: string) => {
    setIsProcessing(true)
    setSelectedPaymentMethod(app)
    await initializeCashfreeCheckout('upi')
  }

  // Handle card payment click
  const handleCardPaymentClick = async () => {
    setIsProcessing(true)
    setSelectedPaymentMethod('card')
    setShowCardForm(true)
    setIsProcessing(false)
  }

  // Handle card form submission using Cashfree checkout
  const handleCardFormSubmit = async () => {
    setIsProcessing(true)
    await initializeCashfreeCheckout('card')
  }

  // Handle back from card form
  const handleBackFromCardForm = () => {
    setShowCardForm(false)
    setCashfreeOrderId('')
    setPaymentSessionId('')
    setSelectedPaymentMethod('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div key="modal" className="fixed inset-0 flex items-center justify-center z-50 p-4">
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

                {/* Phone Number Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setCustomerPhone(value)
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-gray-900"
                    required
                  />
                  {customerPhone && customerPhone.length !== 10 && (
                    <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit mobile number</p>
                  )}
                </div>

                {/* Card Form View */}
                {showCardForm ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-blue-700 text-sm">
                        🔒 Your card details are securely handled by Cashfree. We never store your card information.
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
                          disabled={isProcessing || customerPhone.length !== 10}
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
                          disabled={isProcessing || customerPhone.length !== 10}
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
                          disabled={isProcessing || customerPhone.length !== 10}
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
                          disabled={isProcessing || customerPhone.length !== 10}
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
                    disabled={isProcessing || customerPhone.length !== 10}
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

