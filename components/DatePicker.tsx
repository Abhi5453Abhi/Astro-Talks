'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DatePickerProps {
  value: { day: number; month: number; year: number }
  onChange: (date: { day: number; month: number; year: number }) => void
  onClose: () => void
  isOpen: boolean
}

export default function DatePicker({ value, onChange, onClose, isOpen }: DatePickerProps) {
  const [selectedDay, setSelectedDay] = useState(value.day)
  const [selectedMonth, setSelectedMonth] = useState(value.month)
  const [selectedYear, setSelectedYear] = useState(value.year)
  const [scrollPosition, setScrollPosition] = useState({ day: 0, month: 0, year: 0 })

  const dayRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const handleConfirm = () => {
    onChange({ day: selectedDay, month: selectedMonth, year: selectedYear })
    onClose()
  }

  const scrollToCenter = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
      const container = ref.current
      const itemHeight = 48 // Height of each item
      const containerHeight = container.clientHeight
      const scrollPosition = (value * itemHeight) - (containerHeight / 2) + (itemHeight / 2)
      container.scrollTop = scrollPosition
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToCenter(dayRef, selectedDay - 1)
        scrollToCenter(monthRef, selectedMonth - 1)
        scrollToCenter(yearRef, years.indexOf(selectedYear))
        
        // Initialize scroll positions
        if (dayRef.current) {
          setScrollPosition(prev => ({ ...prev, day: dayRef.current!.scrollTop }))
        }
        if (monthRef.current) {
          setScrollPosition(prev => ({ ...prev, month: monthRef.current!.scrollTop }))
        }
        if (yearRef.current) {
          setScrollPosition(prev => ({ ...prev, year: yearRef.current!.scrollTop }))
        }
      }, 100)
    }
  }, [isOpen])

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: any[],
    setter: (value: number) => void,
    getValue: (index: number) => number
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
      if (ref === dayRef) {
        setScrollPosition(prev => ({ ...prev, day: scrollTop }))
      } else if (ref === monthRef) {
        setScrollPosition(prev => ({ ...prev, month: scrollTop }))
      } else if (ref === yearRef) {
        setScrollPosition(prev => ({ ...prev, year: scrollTop }))
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
            <h3 className="text-lg font-bold text-gray-800">Select Date of Birth</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {/* Day Column */}
            <div className="flex-1 relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Day</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={dayRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(dayRef, days, setSelectedDay, (i) => days[i])}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" /> {/* Top padding */}
                {days.map((day, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.day, 
                    48, 
                    96, 
                    dayRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={day}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        day === selectedDay
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      onClick={() => {
                        setSelectedDay(day)
                        scrollToCenter(dayRef, day - 1)
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {day}
                    </div>
                  )
                })}
                <div className="h-24" /> {/* Bottom padding */}
              </div>
            </div>

            {/* Month Column */}
            <div className="flex-[2] relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Month</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={monthRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(monthRef, months, setSelectedMonth, (i) => i + 1)}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" /> {/* Top padding */}
                {months.map((month, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.month, 
                    48, 
                    96, 
                    monthRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={month}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        index + 1 === selectedMonth
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      onClick={() => {
                        setSelectedMonth(index + 1)
                        scrollToCenter(monthRef, index)
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {month}
                    </div>
                  )
                })}
                <div className="h-24" /> {/* Bottom padding */}
              </div>
            </div>

            {/* Year Column */}
            <div className="flex-1 relative">
              <div className="text-center text-xs font-semibold text-gray-500 mb-2">Year</div>
              {/* Selection highlight - fixed position outside scrollable area */}
              <div className="absolute left-0 right-0 top-[calc(1.5rem+120px)] -translate-y-1/2 h-12 bg-amber-100/50 border-y-2 border-amber-500 pointer-events-none z-10" />
              <div
                ref={yearRef}
                className="h-60 overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
                onScroll={() => handleScroll(yearRef, years, setSelectedYear, (i) => years[i])}
                style={{ 
                  scrollBehavior: 'smooth',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="h-24" /> {/* Top padding */}
                {years.map((year, index) => {
                  const transform = get3DTransform(
                    index, 
                    scrollPosition.year, 
                    48, 
                    96, 
                    yearRef.current?.clientHeight || 240
                  )
                  return (
                    <div
                      key={year}
                      className={`h-12 flex items-center justify-center text-lg font-medium snap-center cursor-pointer transition-all relative z-10 ${
                        year === selectedYear
                          ? 'text-amber-700 font-bold'
                          : 'text-gray-400'
                      }`}
                      onClick={() => {
                        setSelectedYear(year)
                        scrollToCenter(yearRef, years.indexOf(year))
                      }}
                      style={{
                        ...transform,
                        transformOrigin: 'center center',
                        willChange: 'transform, opacity'
                      }}
                    >
                      {year}
                    </div>
                  )
                })}
                <div className="h-24" /> {/* Bottom padding */}
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

