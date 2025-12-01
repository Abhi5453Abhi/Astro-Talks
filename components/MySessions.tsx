'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import Image from 'next/image'

interface ChatSession {
  id: string
  astrologer_name: string
  astrologer_image: string | null
  start_time: string
  end_time: string | null
  message_count: number
  is_free_chat: boolean
}

export default function MySessions() {
  const { setCurrentScreen, userProfile } = useStore()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const userId = userProfile?.id || 'default-user'
        console.log('📥 Fetching sessions for userId:', userId, 'userProfile:', userProfile)
        const response = await fetch(`/api/chat-sessions/get?userId=${userId}`)
        const data = await response.json()
        console.log('📥 Sessions response:', data)
        if (data.success) {
          console.log('✅ Found sessions:', data.sessions?.length || 0)
          setSessions(data.sessions || [])
        } else {
          console.error('❌ Failed to fetch sessions:', data.error)
        }
      } catch (error) {
        console.error('❌ Error fetching sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [userProfile])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const handleReplay = (session: ChatSession) => {
    // TODO: Implement replay functionality
    console.log('Replay session:', session.id)
  }

  const handleCallAgain = (session: ChatSession) => {
    // TODO: Navigate to call with astrologer
    console.log('Call again:', session.astrologer_name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">My Sessions</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[120px] bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/50"></div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-400 text-lg">No sessions yet</p>
            <p className="text-gray-500 text-sm mt-2">Start your first consultation below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  {/* Astrologer Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full border-2 border-yellow-400 p-0.5 bg-white">
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                        {session.astrologer_image && session.astrologer_image.startsWith('http') ? (
                          <Image
                            src={session.astrologer_image}
                            alt={session.astrologer_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                            {session.astrologer_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {session.astrologer_name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {formatDate(session.start_time)}
                    </p>
                    {session.message_count > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        {session.message_count} messages
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleReplay(session)}
                      className="px-4 py-2 rounded-full border-2 border-yellow-400 text-yellow-400 font-semibold text-sm hover:bg-yellow-400/10 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Replay
                    </button>
                    <button
                      onClick={() => handleCallAgain(session)}
                      className="px-4 py-2 rounded-full border-2 border-yellow-400 text-yellow-400 font-semibold text-sm hover:bg-yellow-400/10 transition-colors"
                    >
                      Call Again
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

