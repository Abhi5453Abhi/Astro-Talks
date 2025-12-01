'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Authentication feature commented out
// import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import io from 'socket.io-client'
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

interface IncomingCallProps {
  isOpen: boolean
  onAccept: () => void
  onReject: () => void
  callerId: string
  callerName: string
}

export default function IncomingCall({ 
  isOpen, 
  onAccept, 
  onReject,
  callerId,
  callerName
}: IncomingCallProps) {
  // Authentication feature commented out
  // const { data: session } = useSession()
  const { userProfile } = useStore()
  // Use generated user ID instead of session
  const userId = getOrCreateUserId()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize call when accepted
  useEffect(() => {
    if (!isOpen || !isCallActive) return

    const initializeCall = async () => {
      try {
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

        // Get user's audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        })
        
        localStreamRef.current = stream

        // Create RTCPeerConnection
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }

        const peerConnection = new RTCPeerConnection(configuration)
        peerConnectionRef.current = peerConnection

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream)
        })

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0]
          remoteStreamRef.current = remoteStream
          
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream
            remoteAudioRef.current.play().catch(console.error)
          }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              to: callerId,
              candidate: event.candidate
            })
          }
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState)
          if (peerConnection.connectionState === 'failed' || 
              peerConnection.connectionState === 'disconnected') {
            setError('Connection lost')
            handleCallEnd()
          }
        }

        // Socket event handlers
        socket.on('connect', () => {
          console.log('Connected to signaling server as receiver')
        })

        socket.on('offer', async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            
            socket.emit('answer', {
              to: callerId,
              answer: answer
            })
          } catch (error) {
            console.error('Error handling offer:', error)
            setError('Failed to establish connection')
          }
        })

        socket.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          } catch (error) {
            console.error('Error handling answer:', error)
            setError('Failed to establish connection')
          }
        })

        socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit | null }) => {
          try {
            if (candidate) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            }
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        })

        socket.on('call-ended', () => {
          handleCallEnd()
        })

        socket.on('error', (error: Error) => {
          console.error('Socket error:', error)
          setError(error.message || 'Connection error')
        })

        startCallTimer()

      } catch (error: any) {
        console.error('Error initializing call:', error)
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('Microphone permission denied. Please allow microphone access.')
        } else {
          setError('Unable to start call. Please check your microphone permissions.')
        }
      }
    }

    initializeCall()

    return () => {
      if (!isCallActive) {
        cleanup()
      }
    }
  }, [isOpen, isCallActive, callerId])

  // Start call timer
  const startCallTimer = () => {
    if (callStartTimeRef.current) return
    callStartTimeRef.current = Date.now()
    
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current!) / 1000)
        setCallDuration(duration)
      }
    }, 1000)
  }

  // Handle call end
  const handleCallEnd = () => {
    setIsCallActive(false)
    
    if (socketRef.current) {
      socketRef.current.emit('end-call', { to: callerId })
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    callStartTimeRef.current = null
    setCallDuration(0)
    cleanup()
    onReject()
  }

  // Cleanup
  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
  }

  // Handle accept
  const handleAccept = async () => {
    try {
      // Notify caller that call is accepted - both users must use the same server
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
        socket.emit('accept-call', { 
          to: callerId,
          from: userId
        })
        setIsCallActive(true)
        onAccept()
      })
    } catch (error) {
      console.error('Error accepting call:', error)
      setError('Failed to accept call')
    }
  }

  // Handle reject
  const handleReject = () => {
    // Notify caller that call is rejected - both users must use the same server
    const socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket', 'polling'],
      path: '/api/socket',
      query: {
        userId: userId,
        type: 'receiver'
      }
    })

    socket.on('connect', () => {
      socket.emit('reject-call', { to: callerId })
      socket.disconnect()
    })

    handleCallEnd()
    onReject()
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black">
        {!isCallActive ? (
          // Incoming call screen
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 mx-auto shadow-2xl"
              >
                <span className="text-8xl">📞</span>
              </motion.div>
              <h2 className="text-white text-2xl font-bold mb-2">Incoming Call</h2>
              <p className="text-white/70 text-lg mb-8">{callerName}</p>
              
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReject}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-all"
                  title="Reject Call"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all"
                  title="Accept Call"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          // Active call screen
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 mx-auto shadow-2xl"
              >
                <span className="text-8xl">✅</span>
              </motion.div>
              <h2 className="text-white text-2xl font-bold mb-2">Call Active</h2>
              <p className="text-white/70 text-lg mb-2">{callerName}</p>
              <p className="text-white/70 text-sm mb-8">{formatDuration(callDuration)}</p>
              
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isMuted ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
                  } text-white`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🎤'}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCallEnd}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-all"
                  title="End Call"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50"
          >
            {error}
          </motion.div>
        )}

        {/* Audio element for remote stream */}
        <audio ref={remoteAudioRef} autoPlay className="hidden" />
      </div>
    </AnimatePresence>
  )
}

