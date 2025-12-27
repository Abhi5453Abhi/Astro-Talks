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
import { Sparkles } from 'lucide-react'
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
    setFreeChatStartTime,
    setCurrentScreen,
    walletBalance,
    syncFromDatabase,
    syncMessagesToDatabase,
    setUserProfile
  } = useStore()
  // Authentication feature commented out
  // const { status } = useSession()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCashbackOffer, setShowCashbackOffer] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes

  // User details collection state
  const [collectingDetails, setCollectingDetails] = useState(false)
  const [currentDetailStep, setCurrentDetailStep] = useState<'name' | 'dob' | 'gender' | 'placeOfBirth' | 'timeOfBirth' | null>(null)
  const [collectedDetails, setCollectedDetails] = useState<{
    name?: string
    dateOfBirth?: string
    gender?: string
    placeOfBirth?: string
    timeOfBirth?: string
  }>({})
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const detailsCollectionStartedRef = useRef(false)

  // Minimum balance required: 10 minutes at ₹20/min = ₹200
  const MINIMUM_BALANCE = 200
  const hasInsufficientBalance = walletBalance < MINIMUM_BALANCE && !freeChatActive && !isPaidUser

  // Check if chat is blocked (free chat expired or insufficient balance)
  // Also block if we're collecting details (user can still respond to detail questions)
  const isChatBlocked = (freeChatExpired && !isPaidUser) || hasInsufficientBalance
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
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
  // IMPORTANT: Don't start follow-ups if we're collecting details (questionnaire)
  useEffect(() => {
    if (!freeChatActive || hasStartedFollowUpsRef.current || userHasRepliedRef.current) return
    if (collectingDetails) {
      console.log('📝 Collecting details, skipping follow-ups')
      return
    }

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
  }, [messages, freeChatActive, addMessage, collectingDetails])

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

  // Check if user details are complete and start collection if needed
  // This MUST run before any greeting or welcome messages
  useEffect(() => {
    // Only collect details if free chat is active and timer hasn't started
    if (!freeChatActive || freeChatStartTime || isPaidUser) return
    if (detailsCollectionStartedRef.current) return

    // IMPORTANT: If we're collecting details, don't allow any other messages
    if (collectingDetails) return

    // Check if user details are already complete
    // Treat 'Seeker' as incomplete since it's the default placeholder name
    // Only require name and DOB now (gender, place, time are optional)
    const hasCompleteDetails = userProfile &&
      userProfile.name &&
      userProfile.name !== 'Seeker' && // Don't accept default 'Seeker' name
      userProfile.dateOfBirth

    // Check if user details message already exists
    const hasUserDetailsMessage = messages.some(msg => msg.id && msg.id.startsWith('user-details-'))

    if (hasCompleteDetails) {
      if (hasUserDetailsMessage) {
        // Details already collected and message exists, start timer if not already started
        if (!freeChatStartTime) {
          console.log('✅ User details complete, starting timer...')
          // Timer will be started after details are added to chat
          // This prevents welcome messages from appearing before questionnaire completes
          setTimeout(() => startChatTimer(), 100)
        }
      } else {
        // Details complete but message doesn't exist, add message and start timer
        console.log('✅ User details already complete, adding message and starting timer...')
        detailsCollectionStartedRef.current = true

        // Format and add user details message - only show name and DOB (consistent with new flow)
        let formattedDOB = 'Not specified'
        if (userProfile.dateOfBirth) {
          const dobString = userProfile.dateOfBirth
          // Check if it's already in DD-MM-YYYY format (from picker)
          if (dobString.includes('-') && dobString.split('-')[0].length <= 2) {
            // Already in DD-MM-YYYY format
            const [day, month, year] = dobString.split('-')
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
            const monthName = monthNames[parseInt(month) - 1]
            formattedDOB = `${day}-${monthName}-${year}`
          } else {
            // In YYYY-MM-DD format (from database)
            const birthDate = new Date(dobString)
            const day = birthDate.getDate().toString().padStart(2, '0')
            const month = birthDate.toLocaleDateString('en-US', { month: 'long' })
            const year = birthDate.getFullYear()
            formattedDOB = `${day}-${month}-${year}`
          }
        }

        const userDetailsMessage = `Hi, Below are my details:
Name: ${userProfile.name}
Date of Birth: ${formattedDOB}
Gender: ${userProfile.gender || 'Not specified'}
Birth Time: ${userProfile.birthTime || 'Not provided'}
Place of Birth: ${userProfile.placeOfBirth || 'Not provided'}
Zodiac Sign: ${userProfile.zodiacSign || 'Not determined'}
Languages: ${userProfile.languages?.join(', ') || 'English'}`

        addMessage({
          id: `user-details-${Date.now()}`,
          role: 'user',
          content: userDetailsMessage,
          timestamp: Date.now(),
        })

        // Start timer and show welcome messages AFTER details message is added
        // Use setTimeout to ensure message is rendered first
        setTimeout(() => startChatTimer(), 100)
      }
      return
    }

    // Start collecting details
    if (!hasCompleteDetails && !collectingDetails) {
      console.log('📝 Starting user details collection...')
      setCollectingDetails(true)
      detailsCollectionStartedRef.current = true
      startDetailsCollection()
    }
  }, [freeChatActive, freeChatStartTime, isPaidUser, userProfile, messages, collectingDetails])

  // Start details collection flow
  const startDetailsCollection = () => {
    // Check what we already have
    const existingName = userProfile?.name
    const existingDOB = userProfile?.dateOfBirth

    // Initialize collected details with existing data
    setCollectedDetails({
      name: existingName,
      dateOfBirth: existingDOB,
    })

    // Ask for name first if missing - show immediately, no delay
    if (!existingName) {
      setCurrentDetailStep('name')
      // Show question immediately - no delay for questionnaire
      addMessage({
        id: `ask-name-${Date.now()}`,
        role: 'assistant',
        content: 'Please share your name.',
        timestamp: Date.now(),
      })
    } else if (!existingDOB) {
      setCurrentDetailStep('dob')
      // Show question immediately - no delay for questionnaire
      addMessage({
        id: `ask-dob-${Date.now()}`,
        role: 'assistant',
        content: 'Please select your date of birth.',
        timestamp: Date.now(),
      })
    } else {
      // All required details collected, complete the flow
      completeDetailsCollection()
    }
  }

  // Ask for optional details - REMOVED: No longer asking for gender, place, or time
  // Keeping this function for compatibility but it just completes the flow
  const askOptionalDetails = () => {
    completeDetailsCollection()
  }

  // Complete details collection and start timer
  const completeDetailsCollection = () => {
    console.log('✅ All details collected, completing flow...')
    setCollectingDetails(false)
    setCurrentDetailStep(null)

    // Update user profile with collected details
    // Convert DOB from DD-MM-YYYY to YYYY-MM-DD for database storage
    let dbDateOfBirth = collectedDetails.dateOfBirth || userProfile?.dateOfBirth
    console.log('📅 Original DOB:', dbDateOfBirth)
    if (dbDateOfBirth && dbDateOfBirth.includes('-') && dbDateOfBirth.split('-')[0].length <= 2) {
      // Convert DD-MM-YYYY to YYYY-MM-DD
      const [day, month, year] = dbDateOfBirth.split('-')
      dbDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      console.log('📅 Converted DOB to database format:', dbDateOfBirth)
    }

    const updatedProfile = {
      ...userProfile!,
      name: collectedDetails.name || userProfile?.name || 'Seeker',
      dateOfBirth: dbDateOfBirth, // Now in YYYY-MM-DD format for database
      languages: userProfile?.languages || ['english'],
      // Gender, place, and time are now optional - don't require them
      gender: collectedDetails.gender || userProfile?.gender,
      placeOfBirth: collectedDetails.placeOfBirth || userProfile?.placeOfBirth,
      birthTime: collectedDetails.timeOfBirth || userProfile?.birthTime,
    }
    setUserProfile(updatedProfile)
    console.log('💾 Saving profile to database:', updatedProfile)

    // Save profile to database
    fetch('/api/users/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedProfile),
    }).catch(error => {
      console.error('Error saving profile to database:', error)
    })

    // Format and add user details message - only show name and DOB
    // DOB is already in DD-MM-YYYY format, so we need to parse it differently
    let formattedDOB = 'Not specified'
    if (updatedProfile.dateOfBirth) {
      const dobString = updatedProfile.dateOfBirth
      // Check if it's already in DD-MM-YYYY format (from picker)
      if (dobString.includes('-') && dobString.split('-')[0].length <= 2) {
        // Already in DD-MM-YYYY format
        const [day, month, year] = dobString.split('-')
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']
        const monthName = monthNames[parseInt(month) - 1]
        formattedDOB = `${day}-${monthName}-${year}`
      } else {
        // In YYYY-MM-DD format (from database)
        const birthDate = new Date(dobString)
        const day = birthDate.getDate().toString().padStart(2, '0')
        const month = birthDate.toLocaleDateString('en-US', { month: 'long' })
        const year = birthDate.getFullYear()
        formattedDOB = `${day}-${month}-${year}`
      }
    }

    const userDetailsMessage = `Hi, Below are my details:
Name: ${updatedProfile.name}
Date of Birth: ${formattedDOB}
Gender: ${updatedProfile.gender || 'Not specified'}
Birth Time: ${updatedProfile.birthTime || 'Not provided'}
Place of Birth: ${updatedProfile.placeOfBirth || 'Not provided'}
Zodiac Sign: ${updatedProfile.zodiacSign || 'Not determined'}
Languages: ${updatedProfile.languages?.join(', ') || 'English'}`

    addMessage({
      id: `user-details-${Date.now()}`,
      role: 'user',
      content: userDetailsMessage,
      timestamp: Date.now(),
    })

    // Start timer and show welcome messages after a brief delay
    // Pass the updated profile directly to avoid state timing issues
    setTimeout(() => {
      startChatTimer(true, updatedProfile) // Bypass checks and use the profile we just created
    }, 200)
  }

  // Start chat timer and show welcome messages (only after questionnaire is complete)
  const startChatTimer = (bypassSafetyCheck = false, profileData = userProfile) => {
    // Safety check: Don't start timer if we're still collecting details
    // Skip this check if called from completeDetailsCollection (states are already being set to false)
    if (!bypassSafetyCheck && (collectingDetails || currentDetailStep)) {
      console.log('⚠️ Still collecting details, cannot start timer yet')
      return
    }

    // Additional safety check: Ensure user profile has required details
    // Use profileData parameter instead of userProfile state to avoid timing issues
    // Only require name and DOB now (gender, place, time are optional)
    if (!profileData?.name || !profileData?.dateOfBirth) {
      console.log('⚠️ User profile incomplete, cannot start timer yet')
      return
    }

    console.log('⏱️ Starting chat timer...')
    setFreeChatStartTime(Date.now())

    // Show welcome messages only after details are collected
    setTimeout(() => {
      addMessage({
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Welcome to Astronova!',
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

    // Show astrologer joined notification right after welcome messages
    setTimeout(() => {
      addMessage({
        id: `astrologer-joined-${Date.now()}`,
        role: 'system',
        content: '✨ Astrologer Raghav has joined the chat',
        timestamp: Date.now(),
      })
    }, 2500) // 2.5 seconds - right after "Please share your question"

    // Add follow-up prompts to encourage user engagement (only for free chat flow)
    // Store timeouts so they can be cleared when user replies
    if (freeChatActive) {
      const timeout1 = setTimeout(() => {
        addMessage({
          id: `followup-1-${Date.now()}`,
          role: 'assistant',
          content: 'main aapki kya sahayata kar sakta hun',
          timestamp: Date.now(),
        })
      }, 5000) // 5 seconds after welcome messages

      const timeout2 = setTimeout(() => {
        addMessage({
          id: `followup-2-${Date.now()}`,
          role: 'assistant',
          content: 'reply dijiye',
          timestamp: Date.now(),
        })
      }, 11000) // 11 seconds total

      const timeout3 = setTimeout(() => {
        addMessage({
          id: `followup-3-${Date.now()}`,
          role: 'assistant',
          content: 'main aapki pratiksha kar raha hun',
          timestamp: Date.now(),
        })
      }, 14000) // 14 seconds total

      // Store timeouts so they can be cleared when user types/replies
      followUpTimeoutsRef.current = [timeout1, timeout2, timeout3]
    }
  }

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
  // IMPORTANT: Skip greeting if we're collecting details (questionnaire should come first)
  useEffect(() => {
    console.log('Greeting check:', { hasGreeted: hasGreetedRef.current, userProfile: !!userProfile, messagesLength: messages.length, freeChatActive, collectingDetails })

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
    // Don't show regular greeting if free chat was used (questionnaire will be shown instead)
    if (freeChatActive) {
      console.log('Free chat active, skipping regular greeting - questionnaire will be shown')
      hasGreetedRef.current = true
      return
    }
    // Don't show greeting if we're collecting details
    if (collectingDetails) {
      console.log('Collecting details, skipping greeting')
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
  }, [userProfile, messages.length, addMessage, freeChatActive, collectingDetails])

  // Handle user input during details collection
  const handleDetailsInput = (userInput: string) => {
    const lowerInput = userInput.toLowerCase().trim()
    const skipKeywords = ['skip', 'not specified', 'na', 'n/a', 'none']

    if (!currentDetailStep) return

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: Date.now(),
    })

    // Process the input based on current step
    switch (currentDetailStep) {
      case 'name':
        if (userInput.trim().length > 0) {
          const updatedDetails = { ...collectedDetails, name: userInput.trim() }
          setCollectedDetails(updatedDetails)
          // Move to DOB - show immediately
          if (!updatedDetails.dateOfBirth && !userProfile?.dateOfBirth) {
            setCurrentDetailStep('dob')
            addMessage({
              id: `ask-dob-${Date.now()}`,
              role: 'assistant',
              content: 'Please select your date of birth.',
              timestamp: Date.now(),
            })
          } else {
            // Name and DOB collected, complete the flow
            completeDetailsCollection()
          }
        }
        break

      case 'dob':
        // Date comes from the date picker in DD-MM-YYYY format
        // Validate the format but keep it as-is (we'll convert to YYYY-MM-DD for DB later)
        const dobMatch = userInput.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)

        if (dobMatch) {
          const day = parseInt(dobMatch[1])
          const month = parseInt(dobMatch[2])
          const year = parseInt(dobMatch[3])

          // Basic validation
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
            const updatedDetails = { ...collectedDetails, dateOfBirth: userInput }
            setCollectedDetails(updatedDetails)
            console.log('✅ DOB saved:', userInput)
            // Name and DOB collected - complete the flow
            completeDetailsCollection()
          } else {
            addMessage({
              id: `invalid-dob-${Date.now()}`,
              role: 'assistant',
              content: 'Please provide a valid date.',
              timestamp: Date.now(),
            })
          }
        } else {
          // Invalid date format - show immediately
          addMessage({
            id: `invalid-dob-${Date.now()}`,
            role: 'assistant',
            content: 'Please provide a valid date in DD-MM-YYYY format (e.g., 15-01-1990).',
            timestamp: Date.now(),
          })
        }
        break

      case 'gender':
        const genderMap: Record<string, string> = {
          'male': 'male',
          'm': 'male',
          'man': 'male',
          'female': 'female',
          'f': 'female',
          'woman': 'female',
          'other': 'other',
          'o': 'other',
        }
        const normalizedGender = genderMap[lowerInput]
        if (normalizedGender) {
          setCollectedDetails(prev => ({ ...prev, gender: normalizedGender }))
          askOptionalDetails()
        } else {
          // Invalid gender - show immediately
          addMessage({
            id: `invalid-gender-${Date.now()}`,
            role: 'assistant',
            content: 'Please provide a valid gender: Male, Female, or Other.',
            timestamp: Date.now(),
          })
        }
        break

      case 'placeOfBirth':
        if (skipKeywords.includes(lowerInput)) {
          setCollectedDetails(prev => ({ ...prev, placeOfBirth: undefined }))
        } else {
          setCollectedDetails(prev => ({ ...prev, placeOfBirth: userInput.trim() }))
        }
        // Move to time of birth - show immediately
        setCurrentDetailStep('timeOfBirth')
        addMessage({
          id: `ask-time-${Date.now()}`,
          role: 'assistant',
          content: 'Please share your time of birth (optional - you can skip by typing "skip").',
          timestamp: Date.now(),
        })
        break

      case 'timeOfBirth':
        if (skipKeywords.includes(lowerInput)) {
          setCollectedDetails(prev => ({ ...prev, timeOfBirth: undefined }))
        } else {
          setCollectedDetails(prev => ({ ...prev, timeOfBirth: userInput.trim() }))
        }
        // Complete collection
        completeDetailsCollection()
        break
    }
  }

  // Handle input changes with typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Clear follow-up timeouts immediately when user starts typing
    if (freeChatActive && followUpTimeoutsRef.current.length > 0) {
      console.log('⌨️ User is typing, clearing follow-up timeouts...')
      clearFollowUpTimeouts()
      userHasRepliedRef.current = true // Prevent follow-ups from restarting
    }

    // Only manage inactivity timeout for the old follow-up system (if it was started)
    if (freeChatActive && hasStartedFollowUpsRef.current && !userHasRepliedRef.current) {
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

    const userInput = input.trim()
    setInput('')

    // Handle details collection if active
    if (collectingDetails && currentDetailStep) {
      handleDetailsInput(userInput)
      return
    }

    // Clear follow-ups when user sends a message and mark that user has replied
    if (freeChatActive) {
      console.log('📤 Message sent, clearing all follow-ups permanently...')
      clearFollowUpTimeouts()
      userHasRepliedRef.current = true // Mark that user has sent their first message
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: Date.now(),
    }

    addMessage(userMessage)

    // Save message to database
    try {
      const currentUserProfile = useStore.getState().userProfile
      const saveResponse = await fetch('/api/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [userMessage],
          userId: currentUserProfile?.id // Send userId if available
        }),
      })
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}))
        console.error('Error saving message to database:', saveResponse.status, errorData)
      }
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
                  const currentUserProfile = useStore.getState().userProfile
                  const saveResponse = await fetch('/api/messages/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      messages: assistantMessages,
                      userId: currentUserProfile?.id // Send userId if available
                    }),
                  })
                  if (!saveResponse.ok) {
                    const errorData = await saveResponse.json().catch(() => ({}))
                    console.error('Error saving assistant messages to database:', saveResponse.status, errorData)
                  }
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
              const currentUserProfile = useStore.getState().userProfile
              const saveResponse = await fetch('/api/messages/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  messages: assistantMessages,
                  userId: currentUserProfile?.id // Send userId if available
                }),
              })
              if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({}))
                console.error('Error saving assistant messages to database:', saveResponse.status, errorData)
              }
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Night Sky Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background-night-sky.png"
          alt="Night Sky Background"
          fill
          className="object-cover"
          priority
          quality={90}
          unoptimized
        />
        {/* Overlay for better content readability */}
        <div className="absolute inset-0 bg-black/30"></div>
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
        {/* Input section */}
        <div className="max-w-4xl mx-auto">
          {/* Show scroll-wheel date picker when asking for DOB */}
          {collectingDetails && currentDetailStep === 'dob' && (
            <div className="mb-3 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-yellow-500/30 shadow-lg">
              <label className="block text-yellow-400 text-sm font-semibold mb-3 text-center">
                📅 Select your date of birth
              </label>
              <div className="flex gap-2 justify-center items-center">
                {/* Day Picker */}
                <div className="flex-1 max-w-[100px]">
                  <label className="block text-slate-400 text-xs mb-1 text-center">Day</label>
                  <select
                    value={selectedDay}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-center font-medium cursor-pointer hover:bg-slate-600 transition-colors"
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="">DD</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Month Picker */}
                <div className="flex-1 max-w-[120px]">
                  <label className="block text-slate-400 text-xs mb-1 text-center">Month</label>
                  <select
                    value={selectedMonth}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-center font-medium cursor-pointer hover:bg-slate-600 transition-colors"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">MM</option>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Year Picker */}
                <div className="flex-1 max-w-[100px]">
                  <label className="block text-slate-400 text-xs mb-1 text-center">Year</label>
                  <select
                    value={selectedYear}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-center font-medium cursor-pointer hover:bg-slate-600 transition-colors"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={() => {
                  if (selectedDay && selectedMonth && selectedYear) {
                    const day = parseInt(selectedDay)
                    const month = parseInt(selectedMonth)
                    const year = parseInt(selectedYear)

                    // Validate date (check for valid day in month, leap years, etc.)
                    const daysInMonth = new Date(year, month, 0).getDate()
                    if (day > daysInMonth) {
                      addMessage({
                        id: `invalid-date-${Date.now()}`,
                        role: 'assistant',
                        content: `Invalid date. ${month === 2 ? 'February' : 'Month ' + month} ${year} only has ${daysInMonth} days.`,
                        timestamp: Date.now(),
                      })
                      return
                    }

                    // Validate year range
                    const currentYear = new Date().getFullYear()
                    if (year < 1900 || year > currentYear) {
                      addMessage({
                        id: `invalid-year-${Date.now()}`,
                        role: 'assistant',
                        content: `Please select a year between 1900 and ${currentYear}.`,
                        timestamp: Date.now(),
                      })
                      return
                    }

                    const formattedDate = `${selectedDay.padStart(2, '0')}-${selectedMonth.padStart(2, '0')}-${selectedYear}`
                    handleDetailsInput(formattedDate)
                    // Reset selections
                    setSelectedDay('')
                    setSelectedMonth('')
                    setSelectedYear('')
                  }
                }}
                disabled={!selectedDay || !selectedMonth || !selectedYear}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                Done
              </button>
            </div>
          )}

          {/* Show regular input only when NOT collecting DOB */}
          {!(collectingDetails && currentDetailStep === 'dob') && (
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={
                  collectingDetails
                    ? (currentDetailStep === 'dob' ? 'Select date above...' : 'Type your answer...')
                    : isChatBlocked
                      ? 'Chat ended. Please recharge to continue.'
                      : 'Ask Astrologer anything...'
                }
                disabled={isChatBlocked}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping || isChatBlocked}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Insufficient Balance Banner (appears when balance is low) */}
      {hasInsufficientBalance && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 bg-red-500/95 backdrop-blur-sm text-white p-6 text-center z-50 border-t-4 border-red-600 shadow-2xl"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg font-semibold mb-2">
              Your balance is low! Recharge to continue your chat.
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-white text-red-700 px-6 py-3 rounded-full font-bold text-base hover:bg-gray-100 transition-colors shadow-md"
            >
              Recharge Now
            </button>
          </div>
        </motion.div>
      )}

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

