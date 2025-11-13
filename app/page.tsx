'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Onboarding from '@/components/Onboarding'
import ChatInterface from '@/components/ChatInterface'
import FreeChatOption from '@/components/FreeChatOption'
import HomeScreen from '@/components/HomeScreen'
import StartScreen from '@/components/StartScreen'
import DailyHoroscope from '@/components/DailyHoroscope'
import { useStore } from '@/lib/store'

export default function Home() {
  const { userProfile, currentScreen, freeChatClaimed, setCurrentScreen, setFreeChatActive, setFreeChatStartTime, setFreeChatClaimed } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Ensure start screen shows for new users
  useEffect(() => {
    // If no user profile exists and we're not already in onboarding or start, go to start
    if (!userProfile && currentScreen !== 'start' && currentScreen !== 'onboarding') {
      console.log('🔄 No user profile found, resetting to start screen')
      setCurrentScreen('start')
    }
  }, [userProfile, currentScreen, setCurrentScreen])

  // Auto-correct screen if free chat was claimed but screen is still set to free-chat-option
  useEffect(() => {
    if (freeChatClaimed && currentScreen === 'free-chat-option') {
      console.log('🔄 Free chat already claimed, redirecting to home...')
      setCurrentScreen('home')
    }
  }, [freeChatClaimed, currentScreen, setCurrentScreen])

  const handleStartFreeChat = async () => {
    console.log('🎁 Starting free chat...')
    setFreeChatClaimed(true) // Mark free chat as claimed
    setCurrentScreen('chat')
    
    // Format user details message
    if (userProfile) {
      const { addMessage, messages } = useStore.getState()
      
      // Check if user details message already exists
      const hasUserDetails = messages.some(msg => msg.id && msg.id.startsWith('user-details-'))
      
      if (hasUserDetails) {
        console.log('⚠️ User details already added, skipping to chat start...')
        // Just start the timer and skip adding messages again
        setFreeChatActive(true)
        setFreeChatStartTime(Date.now())
        return
      }
      
      const birthDate = new Date(userProfile.dateOfBirth)
      const day = birthDate.getDate().toString().padStart(2, '0')
      const month = birthDate.toLocaleDateString('en-US', { month: 'long' })
      const year = birthDate.getFullYear()
      const formattedDOB = `${day}-${month}-${year}`
      
      const userDetailsMessage = `Hi,
Below are my details:
Name: ${userProfile.name}
Gender: ${userProfile.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : 'Not specified'}
Date of Birth: ${formattedDOB}
Time of Birth: ${userProfile.birthTime || 'Not specified'}
Place of Birth: Not specified`

      // Add user details as user message
      addMessage({
        id: `user-details-${Date.now()}`,
        role: 'user',
        content: userDetailsMessage,
        timestamp: Date.now(),
      })
      
      // Wait a bit, then add automated messages
      setTimeout(() => {
        addMessage({
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Welcome to Astrotalk!',
          timestamp: Date.now(),
        })
      }, 500)
      
      setTimeout(() => {
        addMessage({
          id: `joining-${Date.now()}`,
          role: 'assistant',
          content: 'Astrologer will join within 10 seconds',
          timestamp: Date.now(),
        })
      }, 1000)
      
      setTimeout(() => {
        addMessage({
          id: `share-question-${Date.now()}`,
          role: 'assistant',
          content: 'Please share your question in the meanwhile.',
          timestamp: Date.now(),
        })
      }, 1500)
      
      setTimeout(() => {
        addMessage({
          id: `joined-${Date.now()}`,
          role: 'system',
          content: 'Astrologer has joined',
          timestamp: Date.now(),
        })
        
        // Now start the free chat timer
        setFreeChatActive(true)
        setFreeChatStartTime(Date.now())
      }, 2500)
      
      // Astrologer greeting in Hindi
      setTimeout(() => {
        addMessage({
          id: `greeting-${Date.now()}`,
          role: 'assistant',
          content: 'Jay Shree Sitaram ji 🙏',
          timestamp: Date.now(),
        })
      }, 4000)
    }
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
        <Onboarding />
      ) : !userProfile ? (
        <Onboarding />
      ) : currentScreen === 'home' ? (
        <HomeScreen />
      ) : currentScreen === 'daily-horoscope' ? (
        <DailyHoroscope />
      ) : currentScreen === 'free-chat-option' && !freeChatClaimed ? (
        <FreeChatOption onStartFreeChat={handleStartFreeChat} onSkip={handleSkip} />
      ) : currentScreen === 'free-chat-option' && freeChatClaimed ? (
        <HomeScreen />
      ) : (
        <ChatInterface />
      )}
    </main>
  )
}

