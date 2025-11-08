'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import PaymentModal from './PaymentModal'
import CashbackOfferModal from './CashbackOfferModal'
import InlineChatRechargePrompt from './InlineChatRechargePrompt'
import ContinueChatBanner from './ContinueChatBanner'

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
    walletBalance
  } = useStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCashbackOffer, setShowCashbackOffer] = useState(false)
  const [showContinueBanner, setShowContinueBanner] = useState(false)
  const [showInlineRecharge, setShowInlineRecharge] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  
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
      const remaining = Math.max(0, 120 - elapsed) // 2 minutes = 120 seconds
      
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
    setInput('')
    setIsTyping(true)

    // Simulate realistic typing delay - 5 seconds
    const typingDelay = 5000

    setTimeout(async () => {
      try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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

        if (!freeReadingUsed && messages.length >= 4) {
          setFreeReadingUsed(true)
        }

        // Split response by comma and send as separate messages with delays
        const fullResponse = data.message || "The cosmic energies are unclear... please try again."
        const parts = fullResponse.split(',').map((part: string) => part.trim()).filter((part: string) => part.length > 0)
        
        console.log('📨 AI Response parts:', parts.length, parts)
        
        // Add first part immediately
        if (parts[0]) {
          addMessage({
            id: `${Date.now()}-1`,
            role: 'assistant',
            content: parts[0],
            timestamp: Date.now(),
            isPaid: data.isPaidContent,
          })
        }
        
        // Add remaining parts with 1.5s delays
        parts.slice(1).forEach((part: string, index: number) => {
          setTimeout(() => {
            addMessage({
              id: `${Date.now()}-${index + 2}`,
              role: 'assistant',
              content: part,
              timestamp: Date.now(),
              isPaid: data.isPaidContent,
            })
          }, (index + 1) * 1500)
        })
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
    setShowInlineRecharge(true) // Show inline recharge prompt
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

  const handleInlineRecharge = (selectedAmounts: number[]) => {
    console.log('💳 Inline recharge clicked with amounts:', selectedAmounts)
    setShowInlineRecharge(false)
    setShowPaymentModal(true) // Open payment modal
  }

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful')
    setFreeChatExpired(false)
    setShowPaymentModal(false)
    setShowCashbackOffer(false)
    setShowInlineRecharge(false)
    // Banner will hide automatically because isChatBlocked becomes false
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 p-4 shadow-sm"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all font-bold text-lg"
            >
              ←
            </button>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-xl shadow-lg"
            >
              ✨
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Astrologer</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
                  walletBalance < MINIMUM_BALANCE
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
                  timeRemaining <= 30 
                    ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse' 
                    : 'bg-purple-100 text-purple-700 border border-purple-300'
                }`}
              >
                <span>⏱️</span>
                <span className="tabular-nums">{formatTime(timeRemaining)}</span>
              </motion.div>
            )}
            
            {!isPaidUser && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ✨ Unlock Deeper Insights
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-3 pb-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          
          {/* Show inline recharge prompt only when explicitly shown */}
          {showInlineRecharge && (
            <InlineChatRechargePrompt onProceedToPay={handleInlineRecharge} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white border-t border-gray-200 p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isChatBlocked ? "Recharge to continue chatting..." : "Ask Astrologer anything..."}
            rows={1}
            disabled={isChatBlocked}
            className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping || isChatBlocked}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            Send
          </button>
        </div>
      </motion.div>

      {/* Continue Chat Banner */}
      <AnimatePresence>
        {isChatBlocked && !showInlineRecharge && userProfile && (
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
    </div>
  )
}

