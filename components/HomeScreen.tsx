'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
// Authentication feature commented out
// import AuthButton from '@/components/AuthButton'
import RealCall from '@/components/RealCall'
import AstrologerCard from '@/components/AstrologerCard'
import { Home, MessageCircle, Sparkles, Sun, ScrollText, Heart, BookOpen } from 'lucide-react'
import { useScreenTime, trackClick, trackFeatureUsage } from '@/lib/analytics'

export default function HomeScreen() {
  // Track screen time
  useScreenTime('home')

  // Authentication feature commented out
  // const { data: session } = useSession()
  const {
    userProfile,
    walletBalance,
    freeChatClaimed,
    currentScreen,
    setCurrentScreen,
  } = useStore()
  const [showCall, setShowCall] = useState(false)
  const [astrologerUserId, setAstrologerUserId] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)
  const [isLoadingAstrologer, setIsLoadingAstrologer] = useState(false)
  const [astrologersList, setAstrologersList] = useState<any[]>([])
  const [isLoadingAstrologersList, setIsLoadingAstrologersList] = useState(true)

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

  // Footer should show on home screen, or when HomeScreen is rendered for free-chat-option (after redirect)
  // The redirect in app/page.tsx will change currentScreen to 'home', but during the transition
  // we still want to show the footer
  const isHomeContext = currentScreen === 'home' || (currentScreen === 'free-chat-option' && freeChatClaimed)

  const features = [
    {
      icon: <Sun className="w-8 h-8 text-white" />,
      label: 'Daily\nHoroscope',
      color: 'from-amber-400 to-amber-600',
      action: () => {
        trackClick('feature_daily_horoscope', 'home')
        setCurrentScreen('daily-horoscope')
      },
    },
    {
      icon: <ScrollText className="w-8 h-8 text-white" />,
      label: 'Free\nKundli',
      color: 'from-amber-400 to-amber-600',
      action: () => trackClick('feature_free_kundli', 'home')
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      label: 'Kundli\nMatching',
      color: 'from-amber-400 to-amber-600',
      action: () => trackClick('feature_kundli_matching', 'home')
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      label: 'Astrology\nBlog',
      color: 'from-amber-400 to-amber-600',
      action: () => trackClick('feature_astrology_blog', 'home')
    },
  ]

  const handleChatWithAstrologer = () => {
    trackClick('chat_now', 'home', {
      has_profile: !!userProfile?.dateOfBirth,
      free_chat_claimed: freeChatClaimed
    })

    // Check if user has completed onboarding
    if (!userProfile || !userProfile.dateOfBirth) {
      // If no profile, go to free-chat-option (onboarding skipped)
      setCurrentScreen('free-chat-option')
      return
    }

    // If free chat already claimed, go directly to chat
    // Otherwise, show the free chat option first
    if (freeChatClaimed) {
      setCurrentScreen('chat')
    } else {
      setCurrentScreen('free-chat-option')
    }
  }

  const handleCallWithAstrologer = async () => {
    trackClick('call_now', 'home', { wallet_balance: walletBalance })

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
    <div className="min-h-screen pb-40 relative overflow-hidden">
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
      <div className="bg-slate-800/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-lg border-b border-slate-700/50 relative z-10">
        <button className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-2xl">
          {userProfile?.name?.charAt(0).toUpperCase() || '😊'}
        </button>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-full shadow-sm">
          <span className="font-bold text-white">₹ {walletBalance}</span>
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-amber-500/30">
            +
          </button>
        </div>

        {/* Authentication feature commented out - AuthButton removed */}
        {/* <div className="hidden sm:block">
          <AuthButton variant="ghost" />
        </div> */}
      </div>

      {/* Authentication feature commented out - AuthButton removed */}
      {/* <div className="px-4 pt-3 sm:hidden relative z-10">
        <AuthButton variant="primary" />
      </div> */}

      {/* Horoscope Button */}
      <div className="px-4 py-4 relative z-10">
        <button
          onClick={() => {
            trackClick('view_horoscope_main', 'home')
            setCurrentScreen('daily-horoscope')
          }}
          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 rounded-full text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Sun className="w-6 h-6" />
          <span className="text-lg tracking-wide">View Your Horoscope</span>
        </button>
      </div>

      {/* Feature Buttons */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.action}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all duration-300`}>
                {feature.icon}
              </div>
              <span className="text-xs text-white/90 text-center leading-tight whitespace-pre-line font-medium tracking-wide">
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
            <button
              onClick={() => trackClick('recharge_now', 'home', { wallet_balance: walletBalance })}
              className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all shadow-lg tracking-wide uppercase text-sm"
            >
              RECHARGE NOW
            </button>
          </div>
        </motion.div>
      </div>

      {/* My Sessions */}
      <div className="px-4 py-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white font-serif tracking-wide">My Sessions</h3>
          <button className="text-sm text-yellow-400 font-semibold hover:text-yellow-300">View All</button>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-slate-700/50">
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-sm text-gray-300">No sessions yet</p>
            <p className="text-xs mt-1 text-gray-400">Start your first consultation below</p>
          </div>
        </div>
      </div>

      {/* Astrologers Section */}
      <div className="px-4 py-4 relative z-10 pb-32">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white font-serif tracking-wide">Astrologers</h3>
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
                onChat={() => {
                  trackClick('astrologer_card_chat', 'home', {
                    astrologer_name: astrologer.name,
                    astrologer_id: astrologer.id
                  })
                  handleChatWithAstrologer()
                }}
              />
            ))}
          </div>
        )}
      </div>

      {isHomeContext && (
        <>
          {/* Action Buttons */}
          <div className="fixed bottom-20 left-0 right-0 px-4 z-30 pointer-events-none">
            <div className="mx-auto max-w-lg pointer-events-auto">
              <button
                onClick={handleChatWithAstrologer}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold tracking-wide py-3 px-4 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] sm:px-6 sm:py-3.5 border border-amber-300/20"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold whitespace-nowrap">Chat Now</span>
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/50 px-6 py-4 shadow-2xl z-20 pb-safe">
            <div className="flex items-center justify-around max-w-md mx-auto w-full">
              <button
                onClick={() => trackClick('bottom_nav_home', 'home')}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="p-1 rounded-xl transition-all duration-300 group-hover:bg-amber-500/10">
                  <Home className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-amber-100/90 uppercase">Home</span>
              </button>

              <button
                onClick={() => {
                  trackClick('bottom_nav_horoscope', 'home')
                  setCurrentScreen('daily-horoscope')
                }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="p-1 rounded-xl transition-all duration-300 group-hover:bg-slate-800">
                  <Sun className="w-7 h-7 text-slate-400 group-hover:text-amber-200 transition-colors" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 group-hover:text-amber-100/80 transition-colors uppercase">Horoscope</span>
              </button>

              <button
                onClick={handleChatWithAstrologer}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="p-1 rounded-xl transition-all duration-300 group-hover:bg-slate-800">
                  <MessageCircle className="w-7 h-7 text-slate-400 group-hover:text-amber-200 transition-colors" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 group-hover:text-amber-100/80 transition-colors uppercase">Chat</span>
              </button>

              <button
                onClick={() => trackClick('bottom_nav_remedies', 'home')}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="p-1 rounded-xl transition-all duration-300 group-hover:bg-slate-800">
                  <Sparkles className="w-7 h-7 text-slate-400 group-hover:text-amber-200 transition-colors" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 group-hover:text-amber-100/80 transition-colors uppercase">Remedies</span>
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

