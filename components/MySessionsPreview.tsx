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

export default function MySessionsPreview() {
  const { setCurrentScreen, userProfile } = useStore()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const userId = userProfile?.id || 'default-user'
        const response = await fetch(`/api/chat-sessions/get?userId=${userId}`)
        const data = await response.json()
        if (data.success) {
          setSessions(data.sessions || [])
        }
      } catch (error) {
        console.error('Error fetching sessions:', error)
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
    <div className="px-4 py-4 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">My Sessions</h3>
        <button 
          onClick={() => setCurrentScreen('my-sessions')}
          className="text-sm text-yellow-400 font-semibold hover:text-yellow-300"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-slate-700/50">
          <div className="h-24 bg-slate-700/50 rounded-xl animate-pulse"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-slate-700/50">
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-sm text-gray-300">No sessions yet</p>
            <p className="text-xs mt-1 text-gray-400">Start your first consultation below</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-slate-700/50">
          <div className="flex items-center gap-4">
            {/* Astrologer Image */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-yellow-400 p-0.5 bg-white">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                  {sessions[0].astrologer_image && sessions[0].astrologer_image.startsWith('http') ? (
                    <Image
                      src={sessions[0].astrologer_image}
                      alt={sessions[0].astrologer_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                      {sessions[0].astrologer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">
                {sessions[0].astrologer_name}
              </h3>
              <p className="text-gray-400 text-sm">
                {formatDate(sessions[0].start_time)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleReplay(sessions[0])}
                className="px-3 py-2 rounded-full border-2 border-yellow-400 text-yellow-400 font-semibold text-xs hover:bg-yellow-400/10 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
              <button
                onClick={() => handleCallAgain(sessions[0])}
                className="px-3 py-2 rounded-full border-2 border-yellow-400 text-yellow-400 font-semibold text-xs hover:bg-yellow-400/10 transition-colors"
              >
                Call Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


