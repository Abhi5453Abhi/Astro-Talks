'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import type { BirthDetails, NatalChart, DashaPeriod, TransitData } from '@/lib/kundali/types'

type MainTab = 'overview' | 'planets' | 'personality' | 'career' | 'relationships' | 'health' | 'predictions'
type ChartTab = 'north' | 'south' | 'D9' | 'D10'

export default function FreeKundli() {
  const { userProfile, setCurrentScreen } = useStore()
  
  // Form state
  const [formData, setFormData] = useState<Partial<BirthDetails>>({
    name: userProfile?.name || '',
    dob: userProfile?.dateOfBirth || '',
    time: userProfile?.birthTime || '12:00:00',
    tz: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    house_system: 'whole',
    ayanamsa: 'lahiri',
  })
  
  // Chart state
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null)
  const [dashas, setDashas] = useState<DashaPeriod[]>([])
  const [transits, setTransits] = useState<TransitData[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [interpretation, setInterpretation] = useState<any>(null)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('overview')
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('north')
  const [selectedMood, setSelectedMood] = useState<'anxious' | 'confident' | 'stuck' | 'excited' | 'curious' | null>(null)
  const [showInput, setShowInput] = useState(true) // Always show input initially

  // Calculate with provided data
  const calculateNatalWithData = useCallback(async (data: Partial<BirthDetails>) => {
    if (!data.dob || !data.time) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/kundali/natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to calculate natal chart')
      
      const result = await response.json()
      setNatalChart(result.data)
      setShowInput(false)
      
      // Calculate dashas
      const dashaResponse = await fetch('/api/kundali/dashas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth: data }),
      })
      if (dashaResponse.ok) {
        const dashaData = await dashaResponse.json()
        setDashas(dashaData.data.mahadashas || [])
      }
      
      // Calculate metrics
      const metricsResponse = await fetch('/api/kundali/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ natal: result.data }),
      })
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData.data)
      }
      
      // Calculate transits
      const transitResponse = await fetch('/api/kundali/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ natal: result.data, date: new Date().toISOString() }),
      })
      if (transitResponse.ok) {
        const transitData = await transitResponse.json()
        setTransits(transitData.data.transits || [])
      }
    } catch (error) {
      console.error('Error calculating natal chart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load from user profile on mount and auto-calculate if data exists
  useEffect(() => {
    if (userProfile?.dateOfBirth && !formData.dob && !natalChart) {
      const newFormData = {
        name: userProfile.name || '',
        dob: userProfile.dateOfBirth,
        time: userProfile.birthTime || '12:00:00',
        tz: 'Asia/Kolkata',
        lat: 28.6139,
        lon: 77.2090,
        house_system: 'whole' as const,
        ayanamsa: 'lahiri' as const,
      }
      setFormData(newFormData)
      
      // Auto-calculate if we have complete data
      if (userProfile.dateOfBirth && userProfile.birthTime) {
        setTimeout(() => {
          calculateNatalWithData(newFormData)
        }, 500)
      }
    }
  }, [userProfile, calculateNatalWithData, natalChart])

  // Calculate natal chart (wrapper for form submission)
  const calculateNatal = useCallback(async () => {
    if (!formData.dob || !formData.time) {
      alert('Please enter date of birth and time')
      return
    }
    await calculateNatalWithData(formData)
  }, [formData, calculateNatalWithData])

  const generateInterpretation = async (mood: typeof selectedMood) => {
    if (!natalChart || !mood) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/kundali/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natal: natalChart,
          dashas,
          transit: transits,
          metrics,
          mood,
          length: 'long',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInterpretation(data.data)
      }
    } catch (error) {
      console.error('Error generating interpretation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedMood && natalChart) {
      generateInterpretation(selectedMood)
    }
  }, [selectedMood])

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-700/50"
        >
          <p className="text-white text-lg mb-4">Please complete your profile first</p>
          <button
            onClick={() => setCurrentScreen('free-chat-option')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-full"
          >
            Get Started
          </button>
        </motion.div>
      </div>
    )
  }

  const mainTabs: { id: MainTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'planets', label: 'Planets', icon: '🪐' },
    { id: 'personality', label: 'Personality', icon: '✨' },
    { id: 'career', label: 'Career & Finance', icon: '💼' },
    { id: 'relationships', label: 'Relationships', icon: '❤️' },
    { id: 'health', label: 'Health & Spiritual', icon: '🧘' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-950/60 backdrop-blur-lg border-b border-white/5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Free Kundali</h1>
              <p className="text-xs text-gray-400">Your personalized Kundali based on birth details</p>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Input Form - Show if no chart or user wants to recalculate */}
        {(showInput || !natalChart) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
          >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.time?.substring(0, 5)}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value + ':00' })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Timezone</label>
                    <select
                      value={formData.tz}
                      onChange={(e) => setFormData({ ...formData, tz: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lon}
                      onChange={(e) => setFormData({ ...formData, lon: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-2">House System</label>
                    <select
                      value={formData.house_system}
                      onChange={(e) => setFormData({ ...formData, house_system: e.target.value as any })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="whole">Whole Sign</option>
                      <option value="equal">Equal</option>
                      <option value="placidus">Placidus</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-2">Ayanamsa</label>
                    <select
                      value={formData.ayanamsa}
                      onChange={(e) => setFormData({ ...formData, ayanamsa: e.target.value as any })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="lahiri">Lahiri (Sidereal)</option>
                      <option value="tropical">Tropical</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={calculateNatal}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Calculating...' : 'Calculate Kundali'}
                </button>
                {natalChart && (
                  <button
                    onClick={() => setShowInput(true)}
                    className="w-full mt-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 rounded-lg text-sm font-medium transition"
                  >
                    Recalculate with Different Details
                  </button>
                )}
              </div>
            </motion.div>
        )}

        {isLoading && (
          <div className="mb-6 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent mb-4"></div>
            <p className="text-gray-400">Calculating your Kundali...</p>
          </div>
        )}

        {natalChart && !isLoading && (
          <>
            {/* Main Tabs */}
            <div className="mb-6 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
              <div className="flex overflow-x-auto gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      activeMainTab === tab.id
                        ? 'bg-yellow-400 text-slate-900'
                        : 'text-gray-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMainTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeMainTab === 'overview' && (
                  <OverviewTab
                    natalChart={natalChart}
                    dashas={dashas}
                    metrics={metrics}
                    formData={formData}
                    activeChartTab={activeChartTab}
                    setActiveChartTab={setActiveChartTab}
                    selectedMood={selectedMood}
                    setSelectedMood={setSelectedMood}
                    interpretation={interpretation}
                  />
                )}
                {activeMainTab === 'planets' && (
                  <PlanetsTab natalChart={natalChart} metrics={metrics} />
                )}
                {activeMainTab === 'personality' && (
                  <PersonalityTab natalChart={natalChart} metrics={metrics} />
                )}
                {activeMainTab === 'career' && (
                  <CareerTab natalChart={natalChart} dashas={dashas} transits={transits} />
                )}
                {activeMainTab === 'relationships' && (
                  <RelationshipsTab natalChart={natalChart} dashas={dashas} />
                )}
                {activeMainTab === 'health' && (
                  <HealthTab natalChart={natalChart} metrics={metrics} />
                )}
                {activeMainTab === 'predictions' && (
                  <PredictionsTab natalChart={natalChart} dashas={dashas} transits={transits} interpretation={interpretation} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({
  natalChart,
  dashas,
  metrics,
  formData,
  activeChartTab,
  setActiveChartTab,
  selectedMood,
  setSelectedMood,
  interpretation,
}: any) {
  return (
    <div className="space-y-6">
      {/* Birth Details */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Birth Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Name</p>
            <p className="font-semibold">{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Date of Birth</p>
            <p className="font-semibold">{new Date(formData.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Time</p>
            <p className="font-semibold">{formData.time}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Place</p>
            <p className="font-semibold">{formData.lat.toFixed(2)}, {formData.lon.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <div className="flex gap-2 mb-4">
          {(['north', 'south', 'D9', 'D10'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveChartTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeChartTab === tab
                  ? 'bg-yellow-400 text-slate-900'
                  : 'bg-slate-900/50 text-gray-400 hover:bg-slate-900'
              }`}
            >
              {tab === 'north' ? 'North Indian' : tab === 'south' ? 'South Indian' : tab}
            </button>
          ))}
        </div>
        <ChartVisualization chart={natalChart} activeTab={activeChartTab} />
      </div>

      {/* Dasha Timeline */}
      {dashas.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Current Dasha</h2>
          <DashaTimeline dashas={dashas} />
        </div>
      )}

      {/* Mood Selector & Interpretation */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Personalized Interpretation</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">How are you feeling today?</p>
          <div className="grid grid-cols-5 gap-3">
            {(['anxious', 'confident', 'stuck', 'excited', 'curious'] as const).map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  selectedMood === mood
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-slate-900/50 text-gray-400 hover:bg-slate-900'
                }`}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {interpretation && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <p className="text-gray-300 leading-relaxed mb-4">{interpretation.long}</p>
            {interpretation.facts && interpretation.facts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">Chart Facts:</h3>
                <ul className="space-y-1">
                  {interpretation.facts.map((fact: string, i: number) => (
                    <li key={i} className="text-xs text-gray-400">• {fact}</li>
                  ))}
                </ul>
              </div>
            )}
            {interpretation.tips && interpretation.tips.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">Actionable Tips:</h3>
                <ul className="space-y-1">
                  {interpretation.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs text-gray-400">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Metrics */}
      {metrics && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Planet Strengths</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.top3 && metrics.top3.map((p: any, i: number) => (
              <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-yellow-400 text-sm">{p.strength}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${p.strength}%` }}
                  />
                </div>
              </div>
            ))}
            {metrics.weakest && (
              <div className="p-3 bg-slate-900/50 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-red-400">Weakest: {metrics.weakest.name}</span>
                  <span className="text-red-400 text-sm">{metrics.weakest.strength}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${metrics.weakest.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Planets Tab
function PlanetsTab({ natalChart, metrics }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Planetary Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {natalChart.planets.map((planet: any) => (
            <div key={planet.name} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{planet.name}</h3>
                {planet.retrograde && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">R</span>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  <span className="text-yellow-400">{planet.sign}</span> {planet.deg}° {planet.min}'
                </p>
                <p className="text-gray-400">
                  {planet.nakshatra} - Pada {planet.pada}
                </p>
                <p className="text-gray-400">
                  Dignity: <span className="text-yellow-400">{planet.dignity}</span>
                </p>
                {metrics?.shadbala?.[planet.name] && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-yellow-400">{Math.round(metrics.shadbala[planet.name].total)}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full"
                        style={{ width: `${metrics.shadbala[planet.name].total}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Personality Tab
function PersonalityTab({ natalChart, metrics }: any) {
  const moon = natalChart.planets.find((p: any) => p.name === 'Moon')
  const sun = natalChart.planets.find((p: any) => p.name === 'Sun')
  const ascendant = natalChart.houses[0]

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Personality Traits</h2>
        <div className="space-y-4">
          {moon && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">Moon Sign ({moon.sign})</h3>
              <p className="text-sm text-gray-300">
                Your Moon in {moon.sign} with {moon.nakshatra} nakshatra indicates emotional depth and intuitive nature.
                This placement influences your inner world and emotional responses.
              </p>
            </div>
          )}
          {sun && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">Sun Sign ({sun.sign})</h3>
              <p className="text-sm text-gray-300">
                Your Sun in {sun.sign} represents your core identity and ego. This sign shapes your fundamental
                personality traits and how you express yourself.
              </p>
            </div>
          )}
          {ascendant && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">Ascendant (Lagna)</h3>
              <p className="text-sm text-gray-300">
                Your rising sign is {ascendant.lord}, which influences how others perceive you and your outward
                personality. This is the mask you wear in the world.
              </p>
            </div>
          )}
        </div>
      </div>

      {natalChart.yogas && natalChart.yogas.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Yogas in Your Chart</h2>
          <div className="space-y-3">
            {natalChart.yogas.map((yoga: any, i: number) => (
              <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-1">{yoga.name}</h3>
                <p className="text-sm text-gray-300">{yoga.description}</p>
                <p className="text-xs text-gray-400 mt-2">Planets: {yoga.planets.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Career Tab
function CareerTab({ natalChart, dashas, transits }: any) {
  const careerHouse = natalChart.houses.find((h: any) => h.num === 10)
  const financeHouse = natalChart.houses.find((h: any) => h.num === 2)

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Career & Finance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerHouse && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">10th House (Career)</h3>
              <p className="text-sm text-gray-300 mb-2">
                Lord: <span className="text-yellow-400">{careerHouse.lord}</span>
              </p>
              <p className="text-sm text-gray-300">
                Planets: {careerHouse.planets.length > 0 ? careerHouse.planets.join(', ') : 'None'}
              </p>
            </div>
          )}
          {financeHouse && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">2nd House (Finance)</h3>
              <p className="text-sm text-gray-300 mb-2">
                Lord: <span className="text-yellow-400">{financeHouse.lord}</span>
              </p>
              <p className="text-sm text-gray-300">
                Planets: {financeHouse.planets.length > 0 ? financeHouse.planets.join(', ') : 'None'}
              </p>
            </div>
          )}
        </div>
      </div>

      {dashas.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Career Dasha Influence</h2>
          <p className="text-sm text-gray-300">
            Current {dashas[0]?.planet} mahadasha influences your career path. This period brings
            opportunities for growth and development in professional matters.
          </p>
        </div>
      )}
    </div>
  )
}

// Relationships Tab
function RelationshipsTab({ natalChart, dashas }: any) {
  const relationshipHouse = natalChart.houses.find((h: any) => h.num === 7)
  const venus = natalChart.planets.find((p: any) => p.name === 'Venus')

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Relationships</h2>
        {venus && (
          <div className="p-4 bg-slate-900/50 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Venus ({venus.sign})</h3>
            <p className="text-sm text-gray-300">
              Venus in {venus.sign} influences your approach to love and relationships.
              This placement affects how you express affection and what you value in partnerships.
            </p>
          </div>
        )}
        {relationshipHouse && (
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h3 className="font-semibold mb-2">7th House (Partnerships)</h3>
            <p className="text-sm text-gray-300 mb-2">
              Lord: <span className="text-yellow-400">{relationshipHouse.lord}</span>
            </p>
            <p className="text-sm text-gray-300">
              Planets: {relationshipHouse.planets.length > 0 ? relationshipHouse.planets.join(', ') : 'None'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Health Tab
function HealthTab({ natalChart, metrics }: any) {
  const healthHouse = natalChart.houses.find((h: any) => h.num === 6)
  const mars = natalChart.planets.find((p: any) => p.name === 'Mars')

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Health & Spiritual</h2>
        {healthHouse && (
          <div className="p-4 bg-slate-900/50 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">6th House (Health)</h3>
            <p className="text-sm text-gray-300 mb-2">
              Lord: <span className="text-yellow-400">{healthHouse.lord}</span>
            </p>
            <p className="text-sm text-gray-300">
              Planets: {healthHouse.planets.length > 0 ? healthHouse.planets.join(', ') : 'None'}
            </p>
          </div>
        )}
        {mars && (
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h3 className="font-semibold mb-2">Mars ({mars.sign})</h3>
            <p className="text-sm text-gray-300">
              Mars influences your physical energy and vitality. Its placement in {mars.sign} affects
              your stamina and approach to physical activities.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Predictions Tab
function PredictionsTab({ natalChart, dashas, transits, interpretation }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Future Predictions</h2>
        {dashas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Upcoming Dashas</h3>
            <div className="space-y-3">
              {dashas.slice(0, 3).map((dasha: any, i: number) => (
                <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-yellow-400">{dasha.planet} Mahadasha</span>
                    <span className="text-sm text-gray-400">
                      {new Date(dasha.start).toLocaleDateString()} - {new Date(dasha.end).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    This period will bring significant changes related to {dasha.planet}'s influence.
                    Focus on areas governed by this planet for best results.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {transits && transits.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Current Transits</h3>
            <div className="space-y-2">
              {transits.slice(0, 5).map((transit: any, i: number) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg text-sm">
                  <span className="font-semibold">{transit.planet}</span> transiting{' '}
                  <span className="text-yellow-400">{transit.sign}</span> in house {transit.house}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Chart Visualization Component
function ChartVisualization({ chart, activeTab }: { chart: NatalChart; activeTab: string }) {
  return (
    <div className="w-full aspect-square bg-slate-900/50 rounded-xl flex items-center justify-center border border-slate-700">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">{activeTab} Chart</p>
        <p className="text-gray-500 text-xs mb-4">Chart visualization coming soon</p>
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {chart.planets.slice(0, 9).map((planet) => (
            <div key={planet.name} className="p-2 bg-slate-800 rounded text-xs">
              <div className="font-semibold">{planet.name}</div>
              <div className="text-gray-400">{planet.sign}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Dasha Timeline Component
function DashaTimeline({ dashas }: { dashas: DashaPeriod[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {dashas.map((dasha, i) => (
          <div
            key={i}
            className={`flex-shrink-0 w-48 p-4 rounded-lg border ${
              i === 0
                ? 'bg-yellow-400/20 border-yellow-400/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}
          >
            <div className={`text-sm font-semibold ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
              {dasha.planet}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(dasha.start).toLocaleDateString()} - {new Date(dasha.end).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(dasha.duration / 365)} years
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
