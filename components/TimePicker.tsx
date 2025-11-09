'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimePickerProps {
  value: { hour: number; minute: number; period: 'AM' | 'PM' }
  onChange: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void
  onClose: () => void
  isOpen: boolean
}

export default function TimePicker({ value, onChange, onClose, isOpen }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(value.hour)
  const [selectedMinute, setSelectedMinute] = useState(value.minute)
  const [selectedPeriod, setSelectedPeriod] = useState(value.period)
  const [scrollPosition, setScrollPosition] = useState({ hour: 0, minute: 0, period: 0 })

  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const periods = ['AM', 'PM']

  const handleConfirm = () => {
    onChange({ hour: selectedHour, minute: selectedMinute, period: selectedPeriod })
    onClose()
  }

  const scrollToCenter = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48
      const containerHeight = container.clientHeight
      const scrollPosition = (value * itemHeight) - (containerHeight / 2) + (itemHeight / 2)
      container.scrollTop = scrollPosition
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToCenter(hourRef, hours.indexOf(selectedHour))
        scrollToCenter(minuteRef, selectedMinute)
        scrollToCenter(periodRef, periods.indexOf(selectedPeriod))
        
        // Initialize scroll positions
        if (hourRef.current) {
          setScrollPosition(prev => ({ ...prev, hour: hourRef.current!.scrollTop }))
        }
        if (minuteRef.current) {
          setScrollPosition(prev => ({ ...prev, minute: minuteRef.current!.scrollTop }))
        }
        if (periodRef.current) {
          setScrollPosition(prev => ({ ...prev, period: periodRef.current!.scrollTop }))
        }
      }, 100)
    }
  }, [isOpen])

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: any[],
    setter: (value: any) => void,
    getValue: (index: number) => any
  ) => {
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48 // h-12 in Tailwind = 48px
      const paddingTop = 96 // h-24 in Tailwind = 96px
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      // Calculate which item is at the center of the visible area
      // Center of viewport = scrollTop + containerHeight/2
      // We need to find which item's center aligns with viewport center
      const viewportCenter = scrollTop + containerHeight / 2
      const firstItemCenter = paddingTop + itemHeight / 2
      const centerIndex = Math.round((viewportCenter - firstItemCenter) / itemHeight)
      const clampedIndex = Math.max(0, Math.min(centerIndex, items.length - 1))
      
      setter(getValue(clampedIndex))
      
      // Update scroll position to trigger re-render for 3D effect
      if (ref === hourRef) {
        setScrollPosition(prev => ({ ...prev, hour: scrollTop }))
      } else if (ref === minuteRef) {
        setScrollPosition(prev => ({ ...prev, minute: scrollTop }))
      } else if (ref === periodRef) {
        setScrollPosition(prev => ({ ...prev, period: scrollTop }))
      }
    }
  }

  const get3DTransform = (
    index: number,
    scrollTop: number,
    itemHeight: number,
    paddingTop: number,
    containerHeight: number
  ) => {
    const viewportCenter = scrollTop + containerHeight / 2
    
    const itemTop = paddingTop + (index * itemHeight)
    const itemCenter = itemTop + itemHeight / 2
    const distanceFromCenter = itemCenter - viewportCenter
    const normalizedDistance = distanceFromCenter / (containerHeight / 2)
    
    // Calculate scale (0.6 to 1.0)
    const scale = Math.max(0.6, 1 - Math.abs(normalizedDistance) * 0.4)
    
    // Calculate opacity (0.3 to 1.0)
    const opacity = Math.max(0.3, 1 - Math.abs(normalizedDistance) * 0.7)
    
    // Calculate rotation for 3D effect
    const rotation = normalizedDistance * 15 // Max 15 degrees
    
    return {
      transform: `scale(${scale}) rotateX(${rotation}deg)`,
      opacity: opacity
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          exit={{ y: 400 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white w-full rounded-t-3xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Select Birth Time</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {/* Hour Column */}
            <div className="flex-1 relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Hour</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={hourRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(hourRef, hours, setSelectedHour, (i) => hours[i])}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {hours.map((hour, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.hour, 
                    48, 
                    96, 
                    hourRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={hour}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        hour === selectedHour
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                      onClick={() => {
                        setSelectedHour(hour)
                        scrollToCenter(hourRef, hours.indexOf(hour))
                      }}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>

            {/* Minute Column */}
            <div className="flex-1 relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Minute</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={minuteRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(minuteRef, minutes, setSelectedMinute, (i) => minutes[i])}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {minutes.map((minute, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.minute, 
                    48, 
                    96, 
                    minuteRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={minute}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        minute === selectedMinute
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                      onClick={() => {
                        setSelectedMinute(minute)
                        scrollToCenter(minuteRef, minute)
                      }}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>

            {/* Period Column */}
            <div className="flex-1 relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Period</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={periodRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(periodRef, periods, setSelectedPeriod, (i) => periods[i])}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" />
                {periods.map((period, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.period, 
                    48, 
                    96, 
                    periodRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={period}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        period === selectedPeriod
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                      onClick={() => {
                        setSelectedPeriod(period as 'AM' | 'PM')
                        scrollToCenter(periodRef, periods.indexOf(period))
                      }}
                    >
                      {period}
                    </div>
                  )
                })}
                <div className="h-24" />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-2xl font-bold text-lg transition-all shadow-lg"
          >
            Confirm
          </button>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

