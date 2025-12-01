'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

interface ComingSoonProps {
  feature: string
  description?: string
}

export default function ComingSoon({ feature, description }: ComingSoonProps) {
  const { setCurrentScreen } = useStore()

  // Planets with minimalist design - circular shapes with colors
  const planets = [
    { name: 'Sun', radius: 70, speed: 20, size: 12, color: 'bg-yellow-400', glow: 'shadow-yellow-400/50' },
    { name: 'Moon', radius: 90, speed: 25, size: 10, color: 'bg-white', glow: 'shadow-white/30' },
    { name: 'Mars', radius: 110, speed: 30, size: 9, color: 'bg-red-400', glow: 'shadow-red-400/50' },
    { name: 'Mercury', radius: 50, speed: 15, size: 7, color: 'bg-gray-400', glow: 'shadow-gray-400/30' },
    { name: 'Jupiter', radius: 130, speed: 35, size: 14, color: 'bg-orange-400', glow: 'shadow-orange-400/50' },
    { name: 'Venus', radius: 60, speed: 18, size: 8, color: 'bg-pink-300', glow: 'shadow-pink-300/50' },
    { name: 'Saturn', radius: 150, speed: 40, size: 11, color: 'bg-blue-300', glow: 'shadow-blue-300/50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-4 flex items-center justify-between shadow-lg border-b border-slate-700/50 sticky top-0 z-10">
        <button
          onClick={() => setCurrentScreen('home')}
          className="text-white hover:text-yellow-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-yellow-400">{feature}</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[70vh]">
        {/* Minimalist Revolving Planets - Kundali Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 relative w-80 h-80 flex items-center justify-center"
        >
          {/* Central Point - Kundali Center */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute z-10 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
          ></motion.div>

          {/* Subtle Orbital Rings */}
          {[70, 90, 110, 130, 150].map((radius, i) => (
            <div
              key={i}
              className="absolute border border-slate-700/10 rounded-full"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                left: '50%',
                top: '50%',
                marginLeft: `-${radius}px`,
                marginTop: `-${radius}px`,
              }}
            />
          ))}

          {/* Revolving Planets - Minimalist Circular Shapes */}
          {planets.map((planet, index) => {
            const initialAngle = (360 / planets.length) * index
            
            return (
              <motion.div
                key={planet.name}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${planet.radius * 2}px`,
                  height: `${planet.radius * 2}px`,
                  marginLeft: `-${planet.radius}px`,
                  marginTop: `-${planet.radius}px`,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: planet.speed,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <motion.div
                  className={`absolute ${planet.color} ${planet.glow} rounded-full shadow-lg`}
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    left: `${planet.radius}px`,
                    top: 0,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: planet.speed,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Coming Soon Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-yellow-400 mb-3">Coming Soon!</h2>
          <p className="text-gray-300 text-lg mb-2">
            We're working hard to bring you
          </p>
          <p className="text-2xl font-semibold text-white mb-4">{feature}</p>
          {description && (
            <p className="text-gray-400 text-sm max-w-md mx-auto">{description}</p>
          )}
        </motion.div>

      </div>
    </div>
  )
}

