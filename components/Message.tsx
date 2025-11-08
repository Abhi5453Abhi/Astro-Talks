'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message as MessageType } from '@/lib/store'

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const [showTime, setShowTime] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  // System message (centered, different style)
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex justify-center my-4"
      >
        <div
          onClick={() => setShowTime(!showTime)}
          className="bg-purple-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer hover:bg-purple-200 transition-all shadow-sm"
        >
          {message.content}
          <AnimatePresence>
            {showTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[10px] text-purple-600 text-center mt-1"
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

