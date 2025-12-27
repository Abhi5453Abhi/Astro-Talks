'use client'

import { useEffect, useRef, useState } from 'react'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import io from 'socket.io-client'
import IncomingCall from './IncomingCall'
import { SIGNALING_SERVER_URL } from '@/lib/socket-config'

type Socket = ReturnType<typeof io>

// Generate or get user ID from localStorage (authentication feature commented out)
const getOrCreateUserId = (): string => {
  if (typeof window === 'undefined') return 'anonymous'
  let userId = localStorage.getItem('user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('user_id', userId)
  }
  return userId
}

export default function CallListener() {
  // Authentication feature commented out
  // const { data: session } = useSession()
  const { userProfile, incomingCall, setIncomingCall } = useStore()
  const socketRef = useRef<Socket | null>(null)
  const [showIncomingCall, setShowIncomingCall] = useState(false)
  // Use generated user ID instead of session - defer to avoid hydration mismatch
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize userId on client-side only to avoid hydration mismatch
  useEffect(() => {
    setUserId(getOrCreateUserId())
  }, [])

  useEffect(() => {
    if (!userId) return

    // Connect to signaling server - both users must use the same server
    const socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket', 'polling'],
      path: '/api/socket',
      query: {
        userId: userId,
        type: 'receiver'
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Call listener connected')
    })

    socket.on('incoming-call', ({ from, fromName }: { from: string; fromName: string }) => {
      console.log('Incoming call from:', from, fromName)

      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `Call from ${fromName}`,
          icon: '/favicon.ico',
          tag: 'incoming-call',
          requireInteraction: true
        })
      }

      // Show incoming call UI
      setIncomingCall({ callerId: from, callerName: fromName })
      setShowIncomingCall(true)
    })

    socket.on('disconnect', () => {
      console.log('Call listener disconnected')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [userId, setIncomingCall])

  const handleAccept = () => {
    setShowIncomingCall(true)
  }

  const handleReject = () => {
    setShowIncomingCall(false)
    setIncomingCall(null)
  }

  if (!incomingCall || !showIncomingCall) return null

  return (
    <IncomingCall
      isOpen={showIncomingCall}
      onAccept={handleAccept}
      onReject={handleReject}
      callerId={incomingCall.callerId}
      callerName={incomingCall.callerName}
    />
  )
}

