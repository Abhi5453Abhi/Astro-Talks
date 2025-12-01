'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import PaymentModal from './PaymentModal'
import CashbackOfferModal from './CashbackOfferModal'
import ContinueChatBanner from './ContinueChatBanner'
import VoiceCall from './VideoCall'
import { ASTROLOGER } from '@/lib/astrologer'

export default function ChatInterface() {
  const {
    userProfile,
    messages,
    addMessage,
    freeReadingUsed,
    isPaidUser,
    setFreeReadingUsed,
    freeChatActive,
    freeChatStartTime,
    freeChatExpired,
    setFreeChatActive,
    setFreeChatExpired,
    setCurrentScreen,
    walletBalance,
    syncFromDatabase,
    syncMessagesToDatabase
  } = useStore()
  // Authentication feature commented out
  // const { status } = useSession()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCashbackOffer, setShowCashbackOffer] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes

  // Minimum balance required: 10 minutes at ₹20/min = ₹200
  const MINIMUM_BALANCE = 200
  const hasInsufficientBalance = walletBalance < MINIMUM_BALANCE && !freeChatActive && !isPaidUser

  // Check if chat is blocked (free chat expired or insufficient balance)
  const isChatBlocked = (freeChatExpired && !isPaidUser) || hasInsufficientBalance
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasGreetedRef = useRef(false)
  const followUpTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedFollowUpsRef = useRef(false)
  const userHasRepliedRef = useRef(false) // Track if user has sent their first message
  const urgencyMessageSentRef = useRef(false) // Track if 20-second urgency message has been sent
  const sessionIdRef = useRef<string | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  const isFreeChatRef = useRef(false)

  // Save chat session
  const saveChatSession = async (endTime?: number) => {
    if (!sessionIdRef.current || !sessionStartTimeRef.current) {
      console.log('⚠️ Cannot save session: missing sessionId or startTime')
      return
    }

    try {
      // Always get the latest userProfile from store
      const state = useStore.getState()
      const currentUserProfile = state.userProfile
      const userId = currentUserProfile?.id || 'default-user'
      const messageCount = state.messages.filter(m => m.role !== 'system').length
      
      console.log('💾 Saving chat session:', {
        sessionId: sessionIdRef.current,
        userId,
        messageCount,
        isFreeChat: isFreeChatRef.current,
        startTime: sessionStartTimeRef.current,
        endTime: endTime || Date.now(),
      })
      
      const response = await fetch('/api/chat-sessions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          astrologerName: ASTROLOGER.name,
          astrologerImage: ASTROLOGER.image,
          startTime: sessionStartTimeRef.current,
          endTime: endTime || Date.now(),
          messageCount,
          isFreeChat: isFreeChatRef.current,
        }),
      })

      const data = await response.json()
      if (data.success) {
        console.log('✅ Chat session saved successfully:', data.session?.id)
      } else {
        console.error('❌ Failed to save chat session:', data.error || data)
      }
    } catch (error) {
      console.error('❌ Error saving chat session:', error)
    }
  }

  // Initialize session when free chat starts (immediately for free chat)
  useEffect(() => {
    if (freeChatActive && !sessionIdRef.current) {
      // For free chat, initialize session immediately when it starts
      sessionIdRef.current = `session-${Date.now()}`
      // Use freeChatStartTime if available, otherwise use current time
      sessionStartTimeRef.current = freeChatStartTime || Date.now()
      isFreeChatRef.current = true
      
      // Save initial session
      saveChatSession().catch(console.error)
    }
  }, [freeChatActive, freeChatStartTime])

  // Initialize session when astrologer joins (for paid chats)
  useEffect(() => {
    const hasAstrologerJoined = messages.some(msg => msg.role === 'system' && msg.content.includes('joined'))
    
    if (hasAstrologerJoined && !sessionIdRef.current && !freeChatActive) {
      // Only initialize for non-free chats (paid chats)
      sessionIdRef.current = `session-${Date.now()}`
      sessionStartTimeRef.current = Date.now()
      isFreeChatRef.current = false
      
      // Save initial session
      saveChatSession().catch(console.error)
    }
  }, [messages, freeChatActive])

  // Save session when chat ends (component unmounts or user leaves)
  useEffect(() => {
    return () => {
      if (sessionIdRef.current && sessionStartTimeRef.current) {
        saveChatSession(Date.now())
      }
    }
  }, [])

  // Save session when free chat expires
  useEffect(() => {
    if (freeChatExpired && sessionIdRef.current && sessionStartTimeRef.current) {
      saveChatSession(Date.now())
    }
  }, [freeChatExpired])

  // Generate urgency message at 20 seconds
  const generateUrgencyMessage = async () => {
    if (urgencyMessageSentRef.current) return
    urgencyMessageSentRef.current = true

    console.log('⚠️ Generating urgency message at 20 seconds...')

    // Collect all user questions
    const userQuestions = messages
      .filter(msg => msg.role === 'user' && !msg.id?.startsWith('user-details-'))
      .map(msg => msg.content)
      .join('; ')

    try {
      const response = await fetch('/api/urgency-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestions,
          userProfile,
        }),
      })

      const data = await response.json()

      if (data.message) {
        // Split urgency message by comma and send as 2 separate messages
        const parts = data.message.split(',').map((part: string) => part.trim()).filter((part: string) => part.length > 0)

        // Add first part immediately
        if (parts[0]) {
          addMessage({
            id: `urgency-${Date.now()}-1`,
            role: 'assistant',
            content: parts[0],
            timestamp: Date.now(),
          })
        }

        // Add second part after 1.5s
        if (parts[1]) {
          setTimeout(() => {
            addMessage({
              id: `urgency-${Date.now()}-2`,
              role: 'assistant',
              content: parts[1],
              timestamp: Date.now(),
            })
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Failed to generate urgency message:', error)
    }
  }

  // Timer for free chat
  useEffect(() => {
    if (!freeChatActive || !freeChatStartTime || isPaidUser) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - freeChatStartTime) / 1000)
      const remaining = Math.max(0, 120 - elapsed) // 2 minutes

      setTimeRemaining(remaining)

      // Send urgency message at 20 seconds
      if (remaining === 20 && !urgencyMessageSentRef.current) {
        generateUrgencyMessage()
      }

      if (remaining === 0) {
        console.log('⏰ Free chat time expired!')
        setFreeChatActive(false)
        setFreeChatExpired(true)
        setShowCashbackOffer(true) // Show cashback offer modal immediately (once)
        // Save session when free chat expires
        if (sessionIdRef.current && sessionStartTimeRef.current) {
          console.log('💾 Saving session on free chat expiry...')
          saveChatSession(Date.now()).catch(console.error)
        }
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [freeChatActive, freeChatStartTime, isPaidUser, setFreeChatActive, messages, userProfile, addMessage])

  // Reset greeting flag if no messages exist
  useEffect(() => {
    if (messages.length === 0 && hasGreetedRef.current) {
      console.log('Resetting greeting flag - no messages exist')
      hasGreetedRef.current = false
    }
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Clear all follow-up timeouts
  const clearFollowUpTimeouts = () => {
    followUpTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    followUpTimeoutsRef.current = []
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
      inactivityTimeoutRef.current = null
    }
  }

  // Start follow-up questions
  const startFollowUpQuestions = () => {
    console.log('🎯 Starting follow-up questions...')
    clearFollowUpTimeouts() // Clear any existing timeouts first

    const timeout1 = setTimeout(() => {
      addMessage({
        id: `followup-1-${Date.now()}`,
        role: 'assistant',
        content: 'main aapki kya sahayata kar sakta hun',
        timestamp: Date.now(),
      })
    }, 3000)

    const timeout2 = setTimeout(() => {
      addMessage({
        id: `followup-2-${Date.now()}`,
        role: 'assistant',
        content: 'reply dijiye',
        timestamp: Date.now(),
      })
    }, 9000)

    const timeout3 = setTimeout(() => {
      addMessage({
        id: `followup-3-${Date.now()}`,
        role: 'assistant',
        content: 'main aapki pratiksha kar raha hun',
        timestamp: Date.now(),
      })
    }, 12000)

    followUpTimeoutsRef.current = [timeout1, timeout2, timeout3]
  }

  // Start follow-ups when greeting message appears (but only if user hasn't replied yet)
  useEffect(() => {
    if (!freeChatActive || hasStartedFollowUpsRef.current || userHasRepliedRef.current) return

    // Check if greeting message exists
    const hasGreeting = messages.some(msg => msg.id && msg.id.startsWith('greeting-'))

    // Check if user has sent any messages (excluding the initial user-details message)
    const userMessages = messages.filter(msg =>
      msg.role === 'user' &&
      msg.id &&
      !msg.id.startsWith('user-details-')
    )

    if (userMessages.length > 0) {
      console.log('🚫 User has already sent a message, not starting follow-ups')
      userHasRepliedRef.current = true
      return
    }

    if (hasGreeting && !hasStartedFollowUpsRef.current && !userHasRepliedRef.current) {
      console.log('👋 Greeting found, starting follow-ups...')
      hasStartedFollowUpsRef.current = true
      startFollowUpQuestions()
    }
  }, [messages, freeChatActive, addMessage])

  // Cleanup timeouts on unmount or when free chat ends
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up follow-up timeouts...')
      clearFollowUpTimeouts()
    }
  }, [])

  // Clear timeouts when free chat ends
  useEffect(() => {
    if (!freeChatActive && hasStartedFollowUpsRef.current) {
      console.log('🛑 Free chat ended, clearing follow-ups...')
      clearFollowUpTimeouts()
      hasStartedFollowUpsRef.current = false
      userHasRepliedRef.current = false // Reset for next session
      urgencyMessageSentRef.current = false // Reset urgency message for next session
    }
  }, [freeChatActive])

  // Authentication feature commented out - load messages without auth requirement
  // Load messages from database on mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        // Authentication check removed - always sync from database
        await syncFromDatabase()
      } catch (error) {
        console.error('Error loading from database:', error)
      }
    }
    loadFromDatabase()
  }, [syncFromDatabase])

  // Check balance when entering chat interface
  useEffect(() => {
    // Only check if not in active free chat and not a paid user
    if (!freeChatActive && !isPaidUser && messages.length > 0) {
      if (walletBalance < MINIMUM_BALANCE) {
        console.log('⚠️ Insufficient balance detected')
        // Banner will show automatically because isChatBlocked is true
      }
    }
  }, [freeChatActive, isPaidUser, walletBalance, messages.length])

  // Initial greeting - only if no messages exist and not in free chat mode
  useEffect(() => {
    console.log('Greeting check:', { hasGreeted: hasGreetedRef.current, userProfile: !!userProfile, messagesLength: messages.length, freeChatActive })

    if (hasGreetedRef.current) {
      console.log('Already greeted, skipping')
      return
    }
    if (!userProfile) {
      console.log('No user profile, skipping')
      return
    }
    if (messages.length > 0) {
      console.log('Messages exist, skipping greeting')
      hasGreetedRef.current = true
      return
    }
    // Don't show regular greeting if free chat was used (messages will be added by free chat flow)
    if (freeChatActive) {
      console.log('Free chat active, skipping regular greeting')
      hasGreetedRef.current = true
      return
    }

    console.log('Sending greeting...')
    hasGreetedRef.current = true

    // Calculate age from DOB
    if (!userProfile.dateOfBirth) return
    const birthDate = new Date(userProfile.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const birthMonth = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

    const primaryLanguage = userProfile.languages[0] || 'english'
    const greetings = {
      english: `Namaste, ${userProfile.name}... 🙏\n\nWelcome to this sacred space. Let me share what I sense about you:\n\n📅 Born: ${birthMonth} (${userProfile.zodiacSign || 'Beautiful soul'})\n${userProfile.birthTime ? `⏰ Birth Time: ${userProfile.birthTime}` : '⏰ Birth Time: Unknown (80% accuracy)'}\n👤 Gender: ${userProfile.gender || 'Not specified'}\n🌟 Your cosmic age: ${age} years of growth and wisdom\n\nThe universe has guided you here. What weighs on your heart?`,
      hindi: `नमस्ते, ${userProfile.name}... 🙏\n\nइस पवित्र स्थान पर आपका स्वागत है। आपके बारे में मुझे जो महसूस होता है:\n\n📅 जन्म: ${birthMonth} (${userProfile.zodiacSign || 'सुंदर आत्मा'})\n${userProfile.birthTime ? `⏰ जन्म समय: ${userProfile.birthTime}` : '⏰ जन्म समय: अज्ञात (80% सटीकता)'}\n👤 लिंग: ${userProfile.gender || 'निर्दिष्ट नहीं'}\n🌟 आपकी आयु: ${age} वर्ष\n\nब्रह्मांड ने आपको यहाँ मार्गदर्शन किया है। आपके मन में क्या है?`,
      punjabi: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ${userProfile.name}... 🙏\n\nਇਸ ਪਵਿੱਤਰ ਥਾਂ 'ਤੇ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਤੁਹਾਡੇ ਬਾਰੇ ਮੈਨੂੰ ਜੋ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ:\n\n📅 ਜਨਮ: ${birthMonth} (${userProfile.zodiacSign || 'ਸੁੰਦਰ ਰੂਹ'})\n${userProfile.birthTime ? `⏰ ਜਨਮ ਸਮਾਂ: ${userProfile.birthTime}` : '⏰ ਜਨਮ ਸਮਾਂ: ਅਣਜਾਣ (80% ਸਹੀ)'}\n👤 ਲਿੰਗ: ${userProfile.gender || 'ਨਿਰਧਾਰਿਤ ਨਹੀਂ'}\n🌟 ਤੁਹਾਡੀ ਉਮਰ: ${age} ਸਾਲ\n\nਬ੍ਰਹਿਮੰਡ ਨੇ ਤੁਹਾਨੂੰ ਇੱਥੇ ਮਾਰਗਦਰਸ਼ਨ ਕੀਤਾ ਹੈ। ਤੁਹਾਡੇ ਦਿਲ 'ਤੇ ਕੀ ਹੈ?`
    }

    const greeting = greetings[primaryLanguage] || greetings.english

    // Show typing first
    setIsTyping(true)

    const timeoutId = setTimeout(() => {
      console.log('Adding greeting message')
      addMessage({
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      })
      setIsTyping(false)
    }, 2000)

    return () => {
      clearTimeout(timeoutId)
      setIsTyping(false)
    }
  }, [userProfile, messages.length, addMessage, freeChatActive])

  // Handle input changes with typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Only manage follow-ups if free chat is active, follow-ups have started, and user hasn't replied yet
    if (freeChatActive && hasStartedFollowUpsRef.current && !userHasRepliedRef.current) {
      console.log('⌨️ User is typing, clearing follow-up timeouts...')

      // Clear follow-up timeouts when user starts typing
      clearFollowUpTimeouts()

      // Set inactivity timeout to restart follow-ups if user stops typing for 8 seconds
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }

      inactivityTimeoutRef.current = setTimeout(() => {
        // Check if user still hasn't sent a message
        if (value.trim().length > 0 && !userHasRepliedRef.current) {
          console.log('💤 User stopped typing but hasn\'t sent. Restarting follow-ups...')
          startFollowUpQuestions()
        }
      }, 8000) // 8 seconds of inactivity
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping || isChatBlocked) return

    // Clear follow-ups when user sends a message and mark that user has replied
    if (freeChatActive) {
      console.log('📤 Message sent, clearing all follow-ups permanently...')
      clearFollowUpTimeouts()
      userHasRepliedRef.current = true // Mark that user has sent their first message
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now(),
    }

    addMessage(userMessage)

    // Save message to database
    try {
      await fetch('/api/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] }),
      })
    } catch (error) {
      console.error('Error saving message to database:', error)
    }

    setInput('')
    setIsTyping(true)

    // Simulate realistic typing delay - 5 seconds
    const typingDelay = 5000

    setTimeout(async () => {
      try {
        // Get current messages from store to ensure we have the latest state
        const currentMessages = useStore.getState().messages
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages,
            userProfile,
            isPaidUser,
            freeReadingUsed,
            freeChatActive,
            timeRemaining,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Payment modal is only shown when timer expires or user clicks "Unlock Deeper Insights"
        // Not triggered by API responses

        // Get current messages count from store
        const currentMessagesCount = useStore.getState().messages.length
        if (!freeReadingUsed && currentMessagesCount >= 4) {
          setFreeReadingUsed(true)
        }

        // Split response by comma and send as separate messages with delays
        const fullResponse = data.message || "The cosmic energies are unclear... please try again."
        const parts = fullResponse.split(',').map((part: string) => part.trim()).filter((part: string) => part.length > 0)

        console.log('📨 AI Response parts:', parts.length, parts)

        // Add first part immediately
        const assistantMessages: Array<{
          id: string
          role: 'assistant'
          content: string
          timestamp: number
          isPaid?: boolean
        }> = []
        if (parts[0]) {
          const firstMessage = {
            id: `${Date.now()}-1`,
            role: 'assistant' as const,
            content: parts[0],
            timestamp: Date.now(),
            isPaid: data.isPaidContent,
          }
          addMessage(firstMessage)
          assistantMessages.push(firstMessage)
        }

        // Add remaining parts with 1.5s delays
        parts.slice(1).forEach((part: string, index: number) => {
          setTimeout(() => {
            const message = {
              id: `${Date.now()}-${index + 2}`,
              role: 'assistant' as const,
              content: part,
              timestamp: Date.now(),
              isPaid: data.isPaidContent,
            }
            addMessage(message)
            assistantMessages.push(message)

            // Save all assistant messages to database after last one
            if (index === parts.length - 2) {
              setTimeout(async () => {
                try {
                  await fetch('/api/messages/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: assistantMessages }),
                  })
                } catch (error) {
                  console.error('Error saving assistant messages to database:', error)
                }
              }, 100)
            }
          }, (index + 1) * 1500)
        })

        // Save assistant messages to database
        if (assistantMessages.length > 0) {
          setTimeout(async () => {
            try {
              await fetch('/api/messages/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: assistantMessages }),
              })
            } catch (error) {
              console.error('Error saving assistant messages to database:', error)
            }
          }, parts.length * 1500 + 500)
        }
      } catch (error) {
        console.error('Chat error:', error)
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: "The cosmic connection seems unstable... please try again, dear one. 🌙",
          timestamp: Date.now(),
        })
      } finally {
        setIsTyping(false)
      }
    }, typingDelay)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleContinueChatClick = () => {
    console.log('💬 Continue chat banner clicked')
    setShowPaymentModal(true) // Open wallet recharge page directly
  }

  const handleRecharge = () => {
    console.log('💳 Recharge clicked from cashback offer')
    setShowCashbackOffer(false)
    setShowPaymentModal(true) // Open payment modal directly
  }

  const handleCashbackClose = () => {
    console.log('❌ Cashback offer closed')
    setShowCashbackOffer(false)
    // Banner will show automatically because isChatBlocked is true
  }

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful')
    setFreeChatExpired(false)
    setShowPaymentModal(false)
    setShowCashbackOffer(false)
    // Banner will hide automatically because isChatBlocked becomes false
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Star background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4 shadow-sm relative z-10"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-10 h-10 rounded-full bg-slate-700/50 hover:bg-slate-700/70 flex items-center justify-center text-gray-300 transition-all font-bold text-lg"
            >
              ←
            </button>
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500">
              <Image
                src={ASTROLOGER.image}
                alt={ASTROLOGER.name}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  // Fallback to sparkle icon if image doesn't exist
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'fallback-icon w-full h-full flex items-center justify-center text-xl'
                    fallback.textContent = '✨'
                    parent.appendChild(fallback)
                  }
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{ASTROLOGER.displayName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            {!freeChatActive && !isPaidUser && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${walletBalance < MINIMUM_BALANCE
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
                  }`}
              >
                <span>💰</span>
                <span className="tabular-nums">₹{walletBalance}</span>
              </motion.div>
            )}

            {/* Free Chat Timer */}
            {freeChatActive && !isPaidUser && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${timeRemaining <= 30
                  ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  }`}
              >
                <span>⏱️</span>
                <span className="tabular-nums">{formatTime(timeRemaining)}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-3 pb-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 p-4 shadow-lg relative z-10"
      >
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isChatBlocked ? "Recharge to continue chatting..." : "Ask Astrologer anything..."}
            rows={1}
            disabled={isChatBlocked}
            className="flex-1 px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping || isChatBlocked}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            Send
          </button>
        </div>
      </motion.div>

      {/* Continue Chat Banner */}
      <AnimatePresence>
        {isChatBlocked && userProfile && (
          <ContinueChatBanner
            userName={userProfile.name}
            onContinueChat={handleContinueChatClick}
          />
        )}
      </AnimatePresence>

      {/* Cashback Offer Modal */}
      <CashbackOfferModal
        isOpen={showCashbackOffer}
        onRecharge={handleRecharge}
        onClose={handleCashbackClose}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Voice Call */}
      <VoiceCall
        isOpen={showVideoCall}
        onClose={() => {
          setShowVideoCall(false)
        }}
        roomId="astro-call-room"
        userName={userProfile?.name || 'User'}
      />
    </div>
  )
}

