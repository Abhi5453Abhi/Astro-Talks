'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { getZodiacSign } from '@/lib/utils'

interface PersonDetails {
  name: string
  dateOfBirth: string
  timeOfBirth: string
  gender: 'male' | 'female' | 'other'
}

interface MatchingResult {
  totalScore: number
  ashtakoot: {
    varna: { score: number; max: number; status: string }
    vashya: { score: number; max: number; status: string }
    tara: { score: number; max: number; status: string }
    yoni: { score: number; max: number; status: string }
    grahaMaitri: { score: number; max: number; status: string }
    gana: { score: number; max: number; status: string }
    bhakoot: { score: number; max: number; status: string }
    nadi: { score: number; max: number; status: string }
  }
  compatibility: {
    overall: string
    marriage: string
    mental: string
    physical: string
    financial: string
  }
  recommendations: string[]
  doshas: string[]
  remedies: string[]
}

export default function KundliMatching() {
  const { setCurrentScreen, userProfile } = useStore()
  const [step, setStep] = useState<'input' | 'results'>('input')
  const [person1, setPerson1] = useState<PersonDetails>({
    name: userProfile?.name || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    timeOfBirth: userProfile?.birthTime || '',
    gender: (userProfile?.gender as 'male' | 'female' | 'other') || 'male',
  })
  const [person2, setPerson2] = useState<PersonDetails>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    gender: 'female',
  })
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calculateMatching = () => {
    if (!person1.name || !person1.dateOfBirth || !person2.name || !person2.dateOfBirth) {
      alert('Please fill in all required details for both persons')
      return
    }

    setIsLoading(true)

    // Simulate calculation (in real app, this would call an API)
    setTimeout(() => {
      const zodiac1 = getZodiacSign(person1.dateOfBirth)
      const zodiac2 = getZodiacSign(person2.dateOfBirth)

      // Calculate Ashtakoot (8-point matching system)
      const ashtakoot = calculateAshtakoot(zodiac1, zodiac2, person1.gender, person2.gender)
      const totalScore = Object.values(ashtakoot).reduce((sum, item) => sum + item.score, 0)
      const maxScore = Object.values(ashtakoot).reduce((sum, item) => sum + item.max, 0)

      // Calculate compatibility
      const compatibility = calculateCompatibility(zodiac1, zodiac2, totalScore, maxScore)

      // Check for doshas
      const doshas = checkDoshas(zodiac1, zodiac2, person1.dateOfBirth, person2.dateOfBirth)

      // Generate recommendations
      const recommendations = generateRecommendations(totalScore, maxScore, doshas)

      // Generate remedies
      const remedies = generateRemedies(doshas, zodiac1, zodiac2)

      setMatchingResult({
        totalScore,
        ashtakoot,
        compatibility,
        recommendations,
        doshas,
        remedies,
      })

      setIsLoading(false)
      setStep('results')
    }, 2000)
  }

  const calculateAshtakoot = (
    zodiac1: string,
    zodiac2: string,
    gender1: string,
    gender2: string
  ) => {
    // Simplified Ashtakoot calculation
    const compatibilityMatrix: { [key: string]: string[] } = {
      'Aries': ['Leo', 'Sagittarius', 'Aquarius'],
      'Taurus': ['Virgo', 'Capricorn', 'Cancer'],
      'Gemini': ['Libra', 'Aquarius', 'Leo'],
      'Cancer': ['Scorpio', 'Pisces', 'Taurus'],
      'Leo': ['Aries', 'Sagittarius', 'Gemini'],
      'Virgo': ['Taurus', 'Capricorn', 'Cancer'],
      'Libra': ['Gemini', 'Aquarius', 'Leo'],
      'Scorpio': ['Cancer', 'Pisces', 'Virgo'],
      'Sagittarius': ['Aries', 'Leo', 'Aquarius'],
      'Capricorn': ['Taurus', 'Virgo', 'Scorpio'],
      'Aquarius': ['Gemini', 'Libra', 'Sagittarius'],
      'Pisces': ['Cancer', 'Scorpio', 'Taurus'],
    }

    const isCompatible = compatibilityMatrix[zodiac1]?.includes(zodiac2) || false

    return {
      varna: {
        score: isCompatible ? 1 : 0,
        max: 1,
        status: isCompatible ? 'Excellent' : 'Good',
      },
      vashya: {
        score: isCompatible ? 2 : 1,
        max: 2,
        status: isCompatible ? 'Excellent' : 'Good',
      },
      tara: {
        score: isCompatible ? 3 : 1,
        max: 3,
        status: isCompatible ? 'Excellent' : 'Moderate',
      },
      yoni: {
        score: isCompatible ? 4 : 2,
        max: 4,
        status: isCompatible ? 'Excellent' : 'Good',
      },
      grahaMaitri: {
        score: isCompatible ? 5 : 2,
        max: 5,
        status: isCompatible ? 'Excellent' : 'Moderate',
      },
      gana: {
        score: isCompatible ? 6 : 3,
        max: 6,
        status: isCompatible ? 'Excellent' : 'Good',
      },
      bhakoot: {
        score: isCompatible ? 7 : 3,
        max: 7,
        status: isCompatible ? 'Excellent' : 'Moderate',
      },
      nadi: {
        score: isCompatible ? 8 : 4,
        max: 8,
        status: isCompatible ? 'Excellent' : 'Good',
      },
    }
  }

  const calculateCompatibility = (
    zodiac1: string,
    zodiac2: string,
    totalScore: number,
    maxScore: number
  ) => {
    const percentage = (totalScore / maxScore) * 100

    let overall = 'Moderate'
    if (percentage >= 75) overall = 'Excellent'
    else if (percentage >= 60) overall = 'Very Good'
    else if (percentage >= 45) overall = 'Good'
    else if (percentage >= 30) overall = 'Moderate'
    else overall = 'Needs Attention'

    return {
      overall,
      marriage: percentage >= 60 ? 'Highly Compatible' : percentage >= 45 ? 'Compatible' : 'Needs Consideration',
      mental: percentage >= 70 ? 'Strong Mental Bond' : percentage >= 50 ? 'Good Understanding' : 'May Need Work',
      physical: percentage >= 65 ? 'Strong Physical Compatibility' : percentage >= 45 ? 'Moderate Compatibility' : 'May Vary',
      financial: percentage >= 60 ? 'Financial Harmony' : percentage >= 40 ? 'Moderate Financial Compatibility' : 'Needs Planning',
    }
  }

  const checkDoshas = (zodiac1: string, zodiac2: string, dob1: string, dob2: string) => {
    const doshas: string[] = []

    // Mangal Dosha (Mars Dosha)
    const marsSigns = ['Aries', 'Scorpio']
    if (marsSigns.includes(zodiac1) && marsSigns.includes(zodiac2)) {
      doshas.push('Mangal Dosha (Mars Dosha) - Both partners have Mars in certain positions')
    }

    // Nadi Dosha
    const nadiGroups: { [key: string]: string } = {
      'Aries': 'A',
      'Taurus': 'B',
      'Gemini': 'C',
      'Cancer': 'A',
      'Leo': 'B',
      'Virgo': 'C',
      'Libra': 'A',
      'Scorpio': 'B',
      'Sagittarius': 'C',
      'Capricorn': 'A',
      'Aquarius': 'B',
      'Pisces': 'C',
    }
    if (nadiGroups[zodiac1] === nadiGroups[zodiac2]) {
      doshas.push('Nadi Dosha - Same Nadi group')
    }

    // Bhakoot Dosha
    const incompatiblePairs: { [key: string]: string[] } = {
      'Aries': ['Libra'],
      'Taurus': ['Scorpio'],
      'Gemini': ['Sagittarius'],
      'Cancer': ['Capricorn'],
      'Leo': ['Aquarius'],
      'Virgo': ['Pisces'],
    }
    if (incompatiblePairs[zodiac1]?.includes(zodiac2) || incompatiblePairs[zodiac2]?.includes(zodiac1)) {
      doshas.push('Bhakoot Dosha - Incompatible zodiac positions')
    }

    return doshas
  }

  const generateRecommendations = (totalScore: number, maxScore: number, doshas: string[]) => {
    const percentage = (totalScore / maxScore) * 100
    const recommendations: string[] = []

    if (percentage >= 75) {
      recommendations.push('Excellent compatibility! This is a highly favorable match.')
      recommendations.push('Both partners complement each other well in all aspects of life.')
      recommendations.push('Marriage is highly recommended with this match.')
    } else if (percentage >= 60) {
      recommendations.push('Very good compatibility. This is a favorable match.')
      recommendations.push('With understanding and effort, this relationship can be very successful.')
      recommendations.push('Marriage is recommended, but both partners should work on communication.')
    } else if (percentage >= 45) {
      recommendations.push('Moderate compatibility. This match has potential but needs work.')
      recommendations.push('Both partners should focus on understanding each other better.')
      recommendations.push('Consider consulting an astrologer for detailed analysis.')
    } else {
      recommendations.push('Compatibility needs attention. This match may face challenges.')
      recommendations.push('Detailed astrological consultation is highly recommended.')
      recommendations.push('Both partners should be prepared to work on the relationship.')
    }

    if (doshas.length > 0) {
      recommendations.push('Some doshas are present. Remedies should be performed before marriage.')
    }

    return recommendations
  }

  const generateRemedies = (doshas: string[], zodiac1: string, zodiac2: string) => {
    const remedies: string[] = []

    if (doshas.some(d => d.includes('Mangal'))) {
      remedies.push('Perform Mangal Dosha Puja to reduce the effects of Mars Dosha')
      remedies.push('Wear Red Coral (Moonga) gemstone after consulting an astrologer')
      remedies.push('Chant Mangal Mantra regularly: "Om Ang Angarkaya Namah"')
    }

    if (doshas.some(d => d.includes('Nadi'))) {
      remedies.push('Perform Nadi Dosha Nivaran Puja')
      remedies.push('Donate to charity and perform acts of kindness')
      remedies.push('Consult an experienced astrologer for specific remedies')
    }

    if (doshas.some(d => d.includes('Bhakoot'))) {
      remedies.push('Perform Bhakoot Dosha Shanti Puja')
      remedies.push('Both partners should perform regular prayers together')
      remedies.push('Seek guidance from an experienced astrologer')
    }

    if (doshas.length === 0) {
      remedies.push('No major doshas detected. General compatibility remedies can be performed.')
      remedies.push('Regular prayers and mutual respect will strengthen the bond.')
    }

    return remedies
  }

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100
    if (percentage >= 75) return 'text-green-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreBgColor = (score: number, max: number) => {
    const percentage = (score / max) * 100
    if (percentage >= 75) return 'bg-green-500/20 border-green-500/30'
    if (percentage >= 50) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-orange-500/20 border-orange-500/30'
  }

  const generateConclusion = (result: MatchingResult, boyName: string, girlName: string) => {
    const percentage = (result.totalScore / 36) * 100
    const hasMangalDosha = result.doshas.some(d => d.includes('Mangal'))
    const hasOtherDoshas = result.doshas.filter(d => !d.includes('Mangal')).length > 0

    let conclusion = `The overall points of this couple represent a ${percentage >= 75 ? 'great' : percentage >= 60 ? 'good' : 'moderate'} combination. `

    if (!hasMangalDosha) {
      conclusion += `Both ${boyName} and ${girlName} have no mangal dosh. `
    } else {
      conclusion += `Mangal dosh is present and needs attention. `
    }

    if (percentage >= 60) {
      conclusion += `Marriage is ${percentage >= 75 ? 'highly' : ''} preferred. `
    } else {
      conclusion += `Marriage needs consideration and consultation. `
    }

    if (hasOtherDoshas || hasMangalDosha) {
      conclusion += `Consult an astrologer to get rid of the few remedies and the doshas present for a harmonious married life ahead. `
    }

    if (!hasMangalDosha) {
      conclusion += `Both boy and girl are not Manglik, which does not lead to any problems.`
    }

    return conclusion
  }

  if (step === 'results' && matchingResult) {
    const totalPercentage = (matchingResult.totalScore / 36) * 100

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 pb-20">
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-4 flex items-center justify-between shadow-lg border-b border-slate-700/50 sticky top-0 z-10">
          <button
            onClick={() => setStep('input')}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-yellow-400">Kundli Matching Results</h1>
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Astrotalk Conclusion Card */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-b from-yellow-400 via-yellow-300 to-white rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Astrotalk Conclusion</h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-slate-800 text-sm leading-relaxed mb-6"
              >
                {generateConclusion(matchingResult, person1.name, person2.name)}
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentScreen('chat')}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg mb-4 hover:shadow-xl transition-all"
              >
                Chat with astrologer
              </motion.button>

              {/* Heart Puzzle Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                {/* Girl */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, type: "spring" }}
                  className="flex items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {person2.name.charAt(0).toUpperCase()}
                  </div>
                  <motion.svg
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
                    className="w-16 h-16 -ml-2"
                    viewBox="0 0 100 100"
                  >
                    <path
                      d="M50,20 C30,10 10,20 10,40 C10,60 30,80 50,90 C70,80 90,60 90,40 C90,20 70,10 50,20 Z"
                      fill="#ec4899"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </motion.svg>
                </motion.div>

                {/* Boy */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, type: "spring" }}
                  className="flex items-center -ml-2"
                >
                  <motion.svg
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
                    className="w-16 h-16"
                    viewBox="0 0 100 100"
                  >
                    <path
                      d="M50,20 C30,10 10,20 10,40 C10,60 30,80 50,90 C70,80 90,60 90,40 C90,20 70,10 50,20 Z"
                      fill="#ec4899"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </motion.svg>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg -ml-2">
                    {person1.name.charAt(0).toUpperCase()}
                  </div>
                </motion.div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Kundli Matching Results',
                      text: `Check out my Kundli matching results with ${person2.name}!`,
                    }).catch(() => {})
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(`Kundli Matching Results: ${person1.name} & ${person2.name} - ${Math.round(totalPercentage)}% compatible`)
                    alert('Results copied to clipboard!')
                  }
                }}
                className="w-full py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share my match
              </motion.button>
            </div>
          </motion.div>

          {/* Overall Score with Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl text-center"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Overall Compatibility Score</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 56 * (1 - totalPercentage / 100)}` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={getScoreColor(matchingResult.totalScore, 36)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className={`text-4xl font-bold ${getScoreColor(matchingResult.totalScore, 36)}`}
                  >
                    {Math.round(totalPercentage)}%
                  </motion.p>
                  <p className="text-sm text-gray-400">{matchingResult.totalScore}/36</p>
                </motion.div>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className={`text-xl font-semibold ${getScoreColor(matchingResult.totalScore, 36)}`}
            >
              {matchingResult.compatibility.overall}
            </motion.p>
          </motion.div>

          {/* Person Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Matching Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Boy</p>
                <p className="text-white font-bold">{person1.name}</p>
                <p className="text-yellow-400 text-sm mt-1">{getZodiacSign(person1.dateOfBirth)}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Girl</p>
                <p className="text-white font-bold">{person2.name}</p>
                <p className="text-yellow-400 text-sm mt-1">{getZodiacSign(person2.dateOfBirth)}</p>
              </div>
            </div>
          </motion.div>

          {/* Ashtakoot Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Ashtakoot Matching (8 Points)</h2>
            <div className="space-y-3">
              {Object.entries(matchingResult.ashtakoot).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  className={`p-4 rounded-xl border ${getScoreBgColor(value.score, value.max)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-gray-400 text-sm">{value.status}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(value.score, value.max)}`}>
                        {value.score}
                      </p>
                      <p className="text-gray-400 text-xs">/ {value.max}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700/30 rounded-full h-2 mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(value.score / value.max) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={`h-2 rounded-full ${
                        (value.score / value.max) * 100 >= 75
                          ? 'bg-green-500'
                          : (value.score / value.max) * 100 >= 50
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Compatibility Aspects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Compatibility Aspects</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Marriage', value: matchingResult.compatibility.marriage },
                { label: 'Mental', value: matchingResult.compatibility.mental },
                { label: 'Physical', value: matchingResult.compatibility.physical },
                { label: 'Financial', value: matchingResult.compatibility.financial },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-700/30 rounded-xl p-4 cursor-pointer"
                >
                  <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                  <p className="text-white font-semibold">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Doshas */}
          {matchingResult.doshas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.5, type: "spring" }}
              className="bg-gradient-to-br from-red-900/20 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-red-500/30 shadow-xl"
            >
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 1.9 }}
                >
                  ⚠️
                </motion.span>
                Doshas Detected
              </motion.h2>
              <div className="space-y-2">
                {matchingResult.doshas.map((dosha, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 + index * 0.1, duration: 0.4 }}
                    className="bg-red-500/10 rounded-xl p-3 border border-red-500/20"
                  >
                    <p className="text-red-300">{dosha}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Recommendations</h2>
            <div className="space-y-3">
              {matchingResult.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.3 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3 bg-slate-700/20 rounded-xl p-4"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.4 + index * 0.1, type: "spring" }}
                    className="text-yellow-400 text-xl"
                  >
                    •
                  </motion.span>
                  <p className="text-gray-300 flex-1">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Remedies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Remedies & Solutions</h2>
            <div className="space-y-3">
              {matchingResult.remedies.map((remedy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.7 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3 bg-slate-700/20 rounded-xl p-4"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 2.8 + index * 0.1, type: "spring" }}
                    className="text-green-400 text-xl"
                  >
                    ✓
                  </motion.span>
                  <p className="text-gray-300 flex-1">{remedy}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="space-y-4"
          >
            {/* Share Feedback */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-300 flex items-center justify-between px-4 hover:bg-slate-800/70 transition-all"
            >
              <span>Share Feedback</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentScreen('chat')}
                className="py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with Astrologer
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentScreen('home')}
                className="py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call with Astrologer
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

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
        <h1 className="text-xl font-bold text-yellow-400">Kundli Matching</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400/20 via-yellow-500/10 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-yellow-400/30 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Match Your Kundli</h2>
          <p className="text-gray-300 text-sm">
            Enter birth details of both persons to calculate compatibility based on Ashtakoot (8-point matching system)
          </p>
        </motion.div>

        {/* Boy's Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Boy's Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Name *</label>
              <input
                type="text"
                value={person1.name}
                onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                placeholder="Enter name"
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Date of Birth *</label>
              <input
                type="date"
                value={person1.dateOfBirth}
                onChange={(e) => setPerson1({ ...person1, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Time of Birth</label>
              <input
                type="time"
                value={person1.timeOfBirth}
                onChange={(e) => setPerson1({ ...person1, timeOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Gender</label>
              <select
                value={person1.gender}
                onChange={(e) => setPerson1({ ...person1, gender: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Girl's Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Girl's Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Name *</label>
              <input
                type="text"
                value={person2.name}
                onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                placeholder="Enter name"
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Date of Birth *</label>
              <input
                type="date"
                value={person2.dateOfBirth}
                onChange={(e) => setPerson2({ ...person2, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Time of Birth</label>
              <input
                type="time"
                value={person2.timeOfBirth}
                onChange={(e) => setPerson2({ ...person2, timeOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Gender</label>
              <select
                value={person2.gender}
                onChange={(e) => setPerson2({ ...person2, gender: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Calculate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={calculateMatching}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Calculating...
              </span>
            ) : (
              'Calculate Compatibility'
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

