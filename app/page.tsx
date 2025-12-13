'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import Onboarding from '@/components/Onboarding'
import ChatInterface from '@/components/ChatInterface'
import FreeChatOption from '@/components/FreeChatOption'
import HomeScreen from '@/components/HomeScreen'
import StartScreen from '@/components/StartScreen'
import DailyHoroscope from '@/components/DailyHoroscope'
import FreeKundli from '@/components/FreeKundli'
import { useStore } from '@/lib/store'
import { ASTROLOGER } from '@/lib/astrologer'

export default function Home() {
  const { userProfile, currentScreen, freeChatClaimed, setCurrentScreen, setFreeChatActive, setFreeChatStartTime, setFreeChatClaimed, syncFromDatabase } = useStore()
  // Authentication feature commented out
  // const { status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Authentication feature commented out - no auth checks needed
  // Load user data from database on mount (without auth requirement)
  // Only sync once on mount to prevent repeated calls that might change screen
  useEffect(() => {
    if (mounted) {
      syncFromDatabase().catch(error => {
        console.error('Error syncing from database:', error)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]) // Remove syncFromDatabase from dependencies to prevent repeated syncing

  // Authentication feature commented out - no auth state changes to handle
  // useEffect(() => {
  //   if (mounted && status === 'authenticated') {
  //     // If user just signed in (from dashboard or start screen), check if they need onboarding
  //     // Redirect if no profile OR if dateOfBirth is missing (incomplete profile)
  //     if ((!userProfile || !userProfile.dateOfBirth) && currentScreen !== 'onboarding' && currentScreen !== 'start') {
  //       console.log('🔄 User authenticated but incomplete profile, redirecting to onboarding')
  //       setCurrentScreen('onboarding')
  //     }
  //   }
  // }, [mounted, status, userProfile, currentScreen, setCurrentScreen])

  // Skip onboarding - go directly to free chat option for new users
  useEffect(() => {
    if (!mounted) return

    // If user tries to go to onboarding, redirect to free-chat-option instead
    if (currentScreen === 'onboarding') {
      console.log('🔄 Skipping onboarding, redirecting to free chat option')
      setCurrentScreen('free-chat-option')
      return
    }

    // If no user profile exists and we're on start screen, go directly to free-chat-option
    if (!userProfile && currentScreen === 'start') {
      console.log('🔄 No user profile found, going directly to free chat option (skipping start screen)')
      setCurrentScreen('free-chat-option')
      return
    }

    // Don't redirect from 'free-chat' screen - let ChatInterface handle the questionnaire
    // ChatInterface will collect user details through questionnaire when free chat starts
  }, [mounted, userProfile, currentScreen, setCurrentScreen])

  // Auto-correct screen if free chat was claimed but screen is still set to free-chat-option
  // Use a ref to prevent infinite loops and ensure redirect happens smoothly
  useEffect(() => {
    if (mounted && freeChatClaimed && currentScreen === 'free-chat-option') {
      // Use setTimeout to ensure state updates happen in the right order
      const timer = setTimeout(() => {
        setCurrentScreen('home')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [mounted, freeChatClaimed, currentScreen, setCurrentScreen])

  // Handle payment callback from Cashfree
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('payment')
      const orderId = urlParams.get('order_id')

      if (paymentStatus && orderId) {
        // Clean up URL immediately to prevent issues
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)

        if (paymentStatus === 'success') {
          // Payment successful - verify payment and update wallet
          console.log('✅ Payment successful, verifying...', orderId)

          // Get stored payment details
          const storedPayment = sessionStorage.getItem('pending_payment')
          let paymentDetails = null
          if (storedPayment) {
            try {
              paymentDetails = JSON.parse(storedPayment)
              // Only use if order ID matches
              if (paymentDetails.orderId !== orderId) {
                paymentDetails = null
              }
            } catch (e) {
              console.error('Error parsing stored payment:', e)
            }
          }

          // Verify payment and update wallet balance
          fetch('/api/cashfree/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                // Update wallet balance if we have payment details
                if (paymentDetails) {
                  const { walletBalance, setWalletBalance, setPaidUser } = useStore.getState()
                  setWalletBalance(walletBalance + paymentDetails.walletCreditAmount)
                  setPaidUser(true)
                  // Clear stored payment
                  sessionStorage.removeItem('pending_payment')
                  console.log('✅ Wallet updated with:', paymentDetails.walletCreditAmount)
                }
                // Navigate to home screen to show updated wallet
                setCurrentScreen('home')
                console.log('✅ Payment verified successfully')
              } else {
                alert(`Payment verification failed: ${data.error || 'Unknown error'}`)
                sessionStorage.removeItem('pending_payment')
              }
            })
            .catch(error => {
              console.error('Payment verification error:', error)
              alert('Payment verification failed. Please contact support.')
              sessionStorage.removeItem('pending_payment')
            })
        } else if (paymentStatus === 'failed' || paymentStatus === 'error') {
          const message = urlParams.get('message') || 'Payment failed'
          alert(`Payment ${paymentStatus === 'error' ? 'error' : 'failed'}: ${message}`)
          // Clear stored payment on failure
          sessionStorage.removeItem('pending_payment')
          // Navigate to home screen
          setCurrentScreen('home')
        }
      }
    }
  }, [mounted, setCurrentScreen])

  const handleStartFreeChat = async () => {
    console.log('🎁 Starting free chat...')

    // Don't create default profile - let ChatInterface collect details through questionnaire
    // ChatInterface will check if profile is incomplete and start the questionnaire flow

    setFreeChatClaimed(true) // Mark free chat as claimed
    setFreeChatActive(true) // Set active immediately to prevent "insufficient balance" flash
    setCurrentScreen('free-chat') // Use 'free-chat' to go directly to ChatInterface

    // Details collection and timer start will be handled by ChatInterface component
    // ChatInterface will ask for name, DOB, gender, place of birth, and time of birth
    // ONLY after questionnaire completes will welcome messages and timer start
  }

  const handleSkip = () => {
    console.log('⏭️ Skipping free chat...')
    setCurrentScreen('home')
    setFreeChatActive(false)
  }

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50">
        <div className="text-gray-800 text-xl">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {currentScreen === 'start' ? (
        <StartScreen />
      ) : currentScreen === 'onboarding' ? (
        // Skip onboarding - show free chat option instead (redirect handled in useEffect)
        <FreeChatOption onStartFreeChat={handleStartFreeChat} onSkip={handleSkip} />
      ) : currentScreen === 'home' ? (
        <HomeScreen />
      ) : currentScreen === 'chat' ? (
        <ChatInterface />
      ) : currentScreen === 'call' ? (
        <HomeScreen />
      ) : currentScreen === 'my-sessions' ? (
        <HomeScreen />
      ) : currentScreen === 'daily-horoscope' ? (
        <DailyHoroscope />
      ) : currentScreen === 'free-kundli' ? (
        <FreeKundli />
      ) : currentScreen === 'kundli-matching' ? (
        <HomeScreen />
      ) : currentScreen === 'remedies' ? (
        <HomeScreen />
      ) : currentScreen === 'free-services' ? (
        <HomeScreen />
      ) : currentScreen === 'free-chat-option' && !freeChatClaimed ? (
        <FreeChatOption onStartFreeChat={handleStartFreeChat} onSkip={handleSkip} />
      ) : currentScreen === 'free-chat-option' && freeChatClaimed ? (
        <HomeScreen />
      ) : currentScreen === 'free-chat' ? (
        <ChatInterface />
      ) : (
        <ChatInterface />
      )}
    </main>
  )
}

