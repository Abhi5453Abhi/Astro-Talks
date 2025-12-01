'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message as MessageType } from '@/lib/store'
import { ASTROLOGER } from '@/lib/astrologer'
import Image from 'next/image'

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const [showTime, setShowTime] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isJoinedMessage = isSystem && message.content.includes('has joined')

  // System message (centered, different style)
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex justify-center items-center gap-2 my-4"
      >
        {isJoinedMessage && (
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500">
            <Image
              src={ASTROLOGER.image}
              alt={ASTROLOGER.name}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                // Fallback to initials if image doesn't exist
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.fallback-initials')) {
                  const fallback = document.createElement('div')
                  fallback.className = 'fallback-initials w-full h-full flex items-center justify-center text-white text-xs font-bold'
                  fallback.textContent = 'RS'
                  parent.appendChild(fallback)
                }
              }}
            />
          </div>
        )}
        <div
          onClick={() => setShowTime(!showTime)}
          className="bg-amber-100 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer hover:bg-amber-200 transition-all shadow-sm"
        >
          {message.content}
          <AnimatePresence>
            {showTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[10px] text-amber-600 text-center mt-1"
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // Regular user/assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        onClick={() => setShowTime(!showTime)}
        className={`max-w-[75%] cursor-pointer ${
          isUser
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-2xl rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm'
        } px-3 py-2 shadow-sm transition-all hover:shadow-md`}
      >
        <div className="whitespace-pre-wrap text-[14px] leading-[1.4]">
          {message.content}
        </div>
        <AnimatePresence>
          {showTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-[10px] mt-1 ${isUser ? 'text-gray-700' : 'text-gray-600'}`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

