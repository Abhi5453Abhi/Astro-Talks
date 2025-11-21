'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { SIGNALING_SERVER_URL } from '@/lib/socket-config'

interface RealCallProps {
  isOpen: boolean
  onClose: () => void
  astrologerUserId: string // The user ID of the astrologer to call
}

export default function RealCall({ 
  isOpen, 
  onClose, 
  astrologerUserId 
}: RealCallProps) {
  const { data: session } = useSession()
  const { userProfile } = useStore()
  const userId = session?.user?.id || 'anonymous'
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended' | 'rejected'>('ringing')
  const [error, setError] = useState<string | null>(null)
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection and call
  useEffect(() => {
    if (!isOpen || !astrologerUserId) return

    const initializeCall = async () => {
      try {
        // Connect to signaling server - both users must use the same server
        const socket = io(SIGNALING_SERVER_URL, {
          transports: ['websocket', 'polling'],
          path: '/api/socket',
          query: {
            userId: userId,
            type: 'caller'
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
          
          setCallStatus('connected')
          setIsCallActive(true)
          startCallTimer()
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              to: astrologerUserId,
              candidate: event.candidate
            })
          }
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState)
          if (peerConnection.connectionState === 'failed' || 
              peerConnection.connectionState === 'disconnected') {
            if (isCallActive) {
              setError('Connection lost')
              setTimeout(() => {
                handleCallEnd()
                onClose()
              }, 2000)
            }
          }
        }

        // Socket event handlers
        socket.on('connect', () => {
          console.log('Connected to signaling server')
          // Initiate call
          socket.emit('initiate-call', {
            to: astrologerUserId,
            from: userId,
            fromName: userProfile?.name || 'User'
          })
        })

        socket.on('call-accepted', async ({ offer }) => {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            
            socket.emit('answer', {
              to: astrologerUserId,
              answer: answer
            })
          } catch (error) {
            console.error('Error handling call acceptance:', error)
            setError('Failed to establish connection')
          }
        })

        socket.on('answer', async ({ answer }) => {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          } catch (error) {
            console.error('Error handling answer:', error)
            setError('Failed to establish connection')
          }
        })

        socket.on('ice-candidate', async ({ candidate }) => {
          try {
            if (candidate) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            }
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        })

        socket.on('call-rejected', () => {
          setCallStatus('rejected')
          setError('Call was rejected')
          setTimeout(() => {
            handleCallEnd()
            onClose()
          }, 2000)
        })

        socket.on('call-ended', () => {
          handleCallEnd()
          onClose()
        })

        socket.on('error', (error) => {
          console.error('Socket error:', error)
          setError(error.message || 'Connection error')
        })

        // Create offer
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        })
        await peerConnection.setLocalDescription(offer)
        
        socket.emit('offer', {
          to: astrologerUserId,
          offer: offer
        })

      } catch (error: any) {
        console.error('Error initializing call:', error)
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('Microphone permission denied. Please allow microphone access.')
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError('No microphone found. Please connect a microphone.')
        } else {
          setError('Unable to start call. Please check your microphone permissions.')
        }
      }
    }

    initializeCall()

    return () => {
      cleanup()
    }
  }, [isOpen, astrologerUserId])

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
    setCallStatus('ended')
    
    if (socketRef.current) {
      socketRef.current.emit('end-call', { to: astrologerUserId })
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

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  // End call
  const endCall = () => {
    handleCallEnd()
    onClose()
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: callStatus === 'ringing' ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                duration: 1, 
                repeat: callStatus === 'ringing' ? Infinity : 0,
                ease: 'easeInOut'
              }}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 mx-auto shadow-2xl"
            >
              <span className="text-8xl">
                {callStatus === 'ringing' ? '📞' : 
                 callStatus === 'connected' ? '✅' : 
                 callStatus === 'rejected' ? '❌' : '📴'}
              </span>
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-2">
              {callStatus === 'ringing' ? 'Calling Astrologer...' : 
               callStatus === 'connected' ? 'Connected' : 
               callStatus === 'rejected' ? 'Call Rejected' :
               'Call Ended'}
            </h2>
            {isCallActive && (
              <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
            )}
          </div>
        </div>

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

        {/* Controls */}
        {callStatus === 'connected' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
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
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-all"
              title="End Call"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        )}

        {/* End call button when not connected */}
        {callStatus !== 'connected' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-all"
              title="Cancel Call"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        )}

        {/* Audio element for remote stream */}
        <audio ref={remoteAudioRef} autoPlay className="hidden" />
      </div>
    </AnimatePresence>
  )
}

