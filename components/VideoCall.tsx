'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'

interface VoiceCallProps {
  isOpen: boolean
  onClose: () => void
  roomId?: string
  userName?: string
}

export default function VoiceCall({ 
  isOpen, 
  onClose, 
  roomId = 'default-room',
  userName = 'User'
}: VoiceCallProps) {
  const { userProfile } = useStore()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  
  const aiAudioRef = useRef<HTMLAudioElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isProcessingRef = useRef(false)

  // Initialize call when component opens
  useEffect(() => {
    if (!isOpen) return

    const initializeCall = async () => {
      try {
        // Get user audio only (no video)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        
        localStreamRef.current = stream

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
          const recognition = new SpeechRecognition()
          
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = userProfile?.languages?.[0] === 'hindi' 
            ? 'hi-IN' 
            : userProfile?.languages?.[0] === 'punjabi'
            ? 'pa-IN'
            : 'en-US'

          recognition.onstart = () => {
            setIsListening(true)
            console.log('🎤 Speech recognition started')
          }

          recognition.onresult = async (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join('')
            
            // Only process final results
            if (event.results[event.results.length - 1].isFinal && !isProcessingRef.current) {
              isProcessingRef.current = true
              await handleUserSpeech(transcript)
            }
          }

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
          }

          recognition.onend = () => {
            setIsListening(false)
            // Restart if call is still active
            if (isCallActive && isOpen) {
              setTimeout(() => {
                try {
                  recognition.start()
                } catch (e) {
                  console.error('Failed to restart recognition:', e)
                }
              }, 100)
            }
          }

          recognitionRef.current = recognition
          recognition.start()
        } else {
          setError('Speech recognition not supported in this browser')
        }

        setIsCallActive(true)
        startCallTimer()

        // Start with AI greeting
        setTimeout(() => {
          handleAIGreeting()
        }, 1000)

      } catch (error: any) {
        console.error('Error initializing call:', error)
        setError('Unable to access microphone. Please check permissions.')
      }
    }

    initializeCall()

    return () => {
      cleanup()
    }
  }, [isOpen])

  // Handle AI greeting
  const handleAIGreeting = async () => {
    const greeting = userProfile?.languages?.[0] === 'hindi'
      ? `नमस्ते ${userProfile?.name || 'User'}, मैं आपकी कैसे मदद कर सकता हूं?`
      : userProfile?.languages?.[0] === 'punjabi'
      ? `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${userProfile?.name || 'User'}, ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`
      : `Hello ${userProfile?.name || 'User'}, how can I help you today?`
    
    await processAIResponse(greeting)
  }

  // Handle user speech
  const handleUserSpeech = async (transcript: string) => {
    if (!transcript.trim()) {
      isProcessingRef.current = false
      return
    }

    console.log('👤 User said:', transcript)

    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: transcript }
    ]
    setConversationHistory(newHistory)

    try {
      // Call AI voice API
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranscript: transcript,
          conversationHistory: newHistory.slice(-10), // Keep last 10 messages
          userProfile,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      if (data.text) {
        // Add AI response to history
        const updatedHistory = [
          ...newHistory,
          { role: 'assistant', content: data.text }
        ]
        setConversationHistory(updatedHistory)

        // Play AI audio response
        if (data.audio) {
          await playAIAudio(data.audio, data.format || 'mp3')
        } else {
          // Fallback: generate TTS from text
          await processAIResponse(data.text)
        }
      }
    } catch (error) {
      console.error('Error processing user speech:', error)
      setError('Failed to process your message. Please try again.')
    } finally {
      isProcessingRef.current = false
    }
  }

  // Process AI response and play audio
  const processAIResponse = async (text: string) => {
    setIsAISpeaking(true)

    try {
      // Generate TTS using OpenAI TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          language: userProfile?.languages?.[0] || 'english',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.audio) {
          await playAIAudio(data.audio, data.format || 'mp3')
        } else {
          // Fallback: use Web Speech API for TTS
          await speakText(text)
        }
      } else {
        // Fallback: use Web Speech API for TTS
        await speakText(text)
      }
    } catch (error) {
      console.error('Error processing AI response:', error)
      // Fallback: use Web Speech API for TTS
      await speakText(text)
    }
  }

  // Speak text using Web Speech API (fallback)
  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = userProfile?.languages?.[0] === 'hindi' 
        ? 'hi-IN' 
        : userProfile?.languages?.[0] === 'punjabi'
        ? 'pa-IN'
        : 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        setIsAISpeaking(false)
        resolve()
      }

      utterance.onerror = () => {
        setIsAISpeaking(false)
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }

  // Play AI audio from base64
  const playAIAudio = async (audioBase64: string, format: string = 'mp3') => {
    try {
      const audioData = atob(audioBase64)
      const arrayBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(arrayBuffer)
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }

      const blob = new Blob([arrayBuffer], { type: `audio/${format}` })
      const audioUrl = URL.createObjectURL(blob)

      if (aiAudioRef.current) {
        aiAudioRef.current.src = audioUrl
        aiAudioRef.current.onended = () => {
          setIsAISpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        aiAudioRef.current.onerror = () => {
          setIsAISpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        await aiAudioRef.current.play()
      }
    } catch (error) {
      console.error('Error playing AI audio:', error)
      setIsAISpeaking(false)
    }
  }

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
    setIsListening(false)
    setIsAISpeaking(false)
    
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
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors
      }
      recognitionRef.current = null
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }


    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
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
        {/* AI Video/Avatar */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: isAISpeaking ? [1, 1.1, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: isAISpeaking ? Infinity : 0,
                  ease: 'easeInOut'
                }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 mx-auto shadow-2xl"
              >
                <span className="text-8xl">✨</span>
              </motion.div>
              <h2 className="text-white text-2xl font-bold mb-2">AI Astrologer</h2>
              <div className="flex items-center justify-center gap-2">
                {isAISpeaking && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                )}
                <p className="text-white/70 text-sm">
                  {isAISpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}
                </p>
              </div>
            </div>
          </div>
          <audio
            ref={aiAudioRef}
            autoPlay
            className="hidden"
          />
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2">
          <p className="text-white font-semibold">{userName}</p>
          {isCallActive && (
            <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Controls */}
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

        {/* Listening Indicator */}
        {isListening && !isAISpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm"
          >
            🎤 Listening...
          </motion.div>
        )}

        {/* Close Button */}
        <button
          onClick={endCall}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
        >
          ✕
        </button>
      </div>
    </AnimatePresence>
  )
}
