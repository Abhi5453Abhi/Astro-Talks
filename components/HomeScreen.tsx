'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
// Authentication feature commented out
// import AuthButton from '@/components/AuthButton'
import RealCall from '@/components/RealCall'
import AstrologerCard from '@/components/AstrologerCard'
import MySessionsPreview from '@/components/MySessionsPreview'

export default function HomeScreen() {
  // Authentication feature commented out
  // const { data: session } = useSession()
  const {
    userProfile,
    walletBalance,
    freeChatClaimed,
    currentScreen,
    setCurrentScreen,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCall, setShowCall] = useState(false)
  const [astrologerUserId, setAstrologerUserId] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)
  const [isLoadingAstrologer, setIsLoadingAstrologer] = useState(false)
  const [astrologersList, setAstrologersList] = useState<any[]>([])
  const [isLoadingAstrologersList, setIsLoadingAstrologersList] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Astrologer email - hardcoded
  const ASTROLOGER_EMAIL = 'raghavshastari@gmail.com'

  // Fetch astrologers list on mount
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await fetch('/api/astrologers/list')
        const data = await response.json()
        if (data.success) {
          setAstrologersList(data.astrologers)
        }
      } catch (error) {
        console.error('Error fetching astrologers list:', error)
      } finally {
        setIsLoadingAstrologersList(false)
      }
    }
    fetchAstrologers()
  }, [])

  // Fetch astrologer user ID from email - lazy load only when needed
  const fetchAstrologerUserId = async () => {
    // If already loaded or currently loading, don't fetch again
    if (astrologerUserId || isLoadingAstrologer) {
      return astrologerUserId
    }

    setIsLoadingAstrologer(true)
    setCallError(null)

    try {
      const response = await fetch(`/api/users/get-by-email?email=${encodeURIComponent(ASTROLOGER_EMAIL)}`)

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Astrologer user not found in database:', ASTROLOGER_EMAIL)
          setCallError('Astrologer not found. Please contact support.')
        } else {
          console.error('Failed to fetch astrologer user ID:', response.status, response.statusText)
          setCallError('Unable to connect to astrologer. Please try again later.')
        }
        return null
      }

      const data = await response.json()

      if (data.success && data.userId) {
        setAstrologerUserId(data.userId)
        return data.userId
      } else {
        console.error('Failed to fetch astrologer user ID:', data.error)
        setCallError('Astrologer not found. Please contact support.')
        return null
      }
    } catch (error) {
      console.error('Error fetching astrologer user ID:', error)
      setCallError('Unable to connect to astrologer. Please try again later.')
      return null
    } finally {
      setIsLoadingAstrologer(false)
    }
  }

  const isHomeContext =
    currentScreen === 'home' ||
    (currentScreen === 'free-chat-option' && freeChatClaimed)

  const features = [
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rising/Setting Sun */}
          {/* Horizon line with curves */}
          <path d="M 16 44 Q 32 50, 48 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <line x1="16" y1="44" x2="10" y2="44" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <line x1="48" y1="44" x2="54" y2="44" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          {/* Seven radiating rays */}
          <line x1="32" y1="44" x2="32" y2="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <line x1="27" y1="44" x2="25" y2="26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="37" y1="44" x2="39" y2="26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="23" y1="44" x2="21" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="41" y1="44" x2="43" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="19" y1="44" x2="18" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="45" y1="44" x2="46" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Daily\nHoroscope',
      color: 'from-yellow-400 to-yellow-500',
      action: () => setCurrentScreen('daily-horoscope'),
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Square Kundli Chart with pattern */}
          <rect x="14" y="14" width="36" height="36" stroke="currentColor" strokeWidth="3.5" fill="none"/>
          {/* Diagonal X */}
          <line x1="14" y1="14" x2="50" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="14" x2="14" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          {/* Horizontal lines */}
          <line x1="14" y1="28" x2="50" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="14" y1="36" x2="50" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          {/* Vertical lines */}
          <line x1="28" y1="14" x2="28" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="36" y1="14" x2="36" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Free\nKundli',
      color: 'from-yellow-400 to-yellow-500',
      action: () => setCurrentScreen('free-kundli'),
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Two interlocking rings */}
          {/* Left ring */}
          <circle cx="24" cy="32" r="12" stroke="currentColor" strokeWidth="4" fill="none"/>
          {/* Right ring */}
          <circle cx="40" cy="32" r="12" stroke="currentColor" strokeWidth="4" fill="none"/>
          {/* Diamond on right ring */}
          <path d="M 40 16 L 44 20 L 40 24 L 36 20 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="40" y1="16" x2="40" y2="24" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
          <line x1="36" y1="20" x2="44" y2="20" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
      ),
      label: 'Kundli\nMatching',
      color: 'from-yellow-400 to-yellow-500',
      action: () => setCurrentScreen('kundli-matching'),
    },
  ]

  const handleChatWithAstrologer = () => {
    // If free chat already claimed, go directly to chat
    // Otherwise, show the free chat option first
    if (freeChatClaimed) {
      setCurrentScreen('chat')
    } else {
      setCurrentScreen('free-chat-option')
    }
  }

  const handleCallWithAstrologer = async () => {
    // Authentication feature commented out - no login check needed
    // if (!session?.user?.id) {
    //   alert('Please login to make a call')
    //   return
    // }

    // Lazy load astrologer user ID if not already loaded
    let userId = astrologerUserId
    if (!userId) {
      userId = await fetchAstrologerUserId()
    }

    // Check if astrologer user ID is available
    if (!userId) {
      if (callError) {
        alert(callError)
      } else {
        alert('Unable to connect to astrologer. Please try again later.')
      }
      return
    }

    // Check wallet balance (optional - you can set minimum balance requirement)
    // if (walletBalance < 200) {
    //   alert('Insufficient balance. Minimum ₹200 required for calling.')
    //   return
    // }

    setShowCall(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 pb-40 relative overflow-hidden">
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

      {/* Profile Menu Drawer */}
      <AnimatePresence>
        {showProfileMenu && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowProfileMenu(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 shadow-2xl z-50 overflow-y-auto"
            >
            {/* Profile Header */}
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-3xl">
                  {userProfile?.name?.charAt(0).toUpperCase() || '😊'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{userProfile?.name || 'User'}</h3>
                  <p className="text-gray-400 text-sm">+91-9501562000</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-4">
              <button
                onClick={() => { setShowProfileMenu(false); setCurrentScreen('home'); }}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Home</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Book a Pooja</span>
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Customer Support</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span>Wallet Transactions</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
                <span>Redeem Gift Card</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Order History</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AstroRemedy</span>
              </button>

              <button
                onClick={() => { setShowProfileMenu(false); setCurrentScreen('chat'); }}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>Chat with Astrologer</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>My following</span>
              </button>

              <button
                onClick={() => { setShowProfileMenu(false); setCurrentScreen('free-services'); }}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
                </svg>
                <span>Free Services</span>
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">FREE</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Settings</span>
              </button>
            </div>

            {/* Social Media Icons */}
            <div className="px-6 py-4 border-t border-slate-700">
              <p className="text-gray-400 text-xs mb-3">Also available on</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <span className="text-xl">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-500 text-xs mt-4">version 11.2.363</p>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-lg border-b border-slate-700/50 relative z-10">
        <button 
          onClick={() => setShowProfileMenu(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          {userProfile?.name?.charAt(0).toUpperCase() || '😊'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-full shadow-sm">
            <span className="font-bold text-white">₹ {walletBalance}</span>
            <button className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">
              +
            </button>
          </div>

          {/* Messenger Icon - My Sessions */}
          <button
            onClick={() => setCurrentScreen('my-sessions')}
            className="relative w-12 h-12 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Authentication feature commented out - AuthButton removed */}
      {/* <div className="px-4 pt-3 sm:hidden relative z-10">
        <AuthButton variant="primary" />
      </div> */}

      {/* Search Bar */}
      <div className="px-4 py-4 relative z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-4 py-3 pl-4 pr-12 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 shadow-lg"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feature Buttons */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.action || undefined}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform`}>
                {feature.icon}
              </div>
              <span className="text-xs text-white text-center leading-tight whitespace-pre-line font-medium">
                {feature.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cashback Banner */}
      <div className="px-4 py-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 shadow-xl"
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-yellow-400 mb-1">
              50% CASHBACK!
            </h2>
            <p className="text-white text-sm mb-4">on your next Recharge</p>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg">
              RECHARGE NOW
            </button>
          </div>
        </motion.div>
      </div>

      {/* My Sessions */}
      <MySessionsPreview />

      {/* Astrologers Section */}
      <div className="px-4 py-4 relative z-10 pb-32">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Astrologers</h3>
          <button className="text-sm text-yellow-400 font-semibold hover:text-yellow-300">View All</button>
        </div>

        {isLoadingAstrologersList ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[160px] w-[160px] h-[220px] bg-slate-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {astrologersList.map((astrologer) => (
              <AstrologerCard
                key={astrologer.id}
                astrologer={astrologer}
                onChat={() => handleChatWithAstrologer()}
              />
            ))}
          </div>
        )}
      </div>

      {isHomeContext && (
        <>
          {/* Action Buttons */}
          <div className="fixed bottom-20 left-0 right-0 px-4 z-30 pointer-events-none">
            <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4 pointer-events-auto">
              <button
                onClick={handleChatWithAstrologer}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-white text-slate-900 font-semibold tracking-wide py-3 px-4 shadow-[0_6px_18px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.3)] sm:px-6 sm:py-3.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </span>
                <span className="text-xs text-slate-900 whitespace-nowrap sm:text-sm">Chat with Astrologer</span>
              </button>
              <button
                onClick={handleCallWithAstrologer}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-white text-slate-900 font-semibold tracking-wide py-3 px-4 shadow-[0_6px_18px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.3)] sm:px-6 sm:py-3.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="text-xs text-slate-900 whitespace-nowrap sm:text-sm">Call with Astrologer</span>
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 shadow-lg z-20">
            <div className="flex items-center justify-around">
              <button 
                onClick={() => setCurrentScreen('home')}
                className="flex flex-col items-center gap-1 text-yellow-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs font-semibold">Home</span>
              </button>
              <button
                onClick={() => setCurrentScreen('chat')}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs">Chat</span>
              </button>
              <button
                onClick={() => setCurrentScreen('call')}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xs">Call</span>
              </button>
              <button
                onClick={() => setCurrentScreen('remedies')}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs">Remedies</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Real Call Component */}
      {showCall && astrologerUserId && (
        <RealCall
          isOpen={showCall}
          onClose={() => setShowCall(false)}
          astrologerUserId={astrologerUserId}
        />
      )}
    </div>
  )
}

