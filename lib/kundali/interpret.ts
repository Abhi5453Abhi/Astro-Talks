/**
 * Kundali Interpretation Generator
 * Creates mood-adaptive, fact-based interpretations
 */

import type {
  InterpretationRequest,
  Interpretation,
  NatalChart,
  DashaPeriod,
  TransitData,
  Shadbala,
} from './types'

const MOOD_TONES: Record<string, { tone: string; keywords: string[] }> = {
  anxious: {
    tone: 'calming, grounding, clear',
    keywords: ['avoid', 'grounding', 'calm', 'breathe', 'patience', 'wait'],
  },
  confident: {
    tone: 'direct, action-oriented, supportive',
    keywords: ['action', 'opportunity', 'go ahead', 'timing', 'launch'],
  },
  stuck: {
    tone: 'incremental, practical, encouraging',
    keywords: ['small steps', 'incremental', 'journal', 'reflect', 'gradual'],
  },
  excited: {
    tone: 'energetic but grounded, cautionary where needed',
    keywords: ['launch', 'visibility', 'risk', 'opportunity', 'momentum'],
  },
  curious: {
    tone: 'educational, explanatory, detailed',
    keywords: ['explain', 'understand', 'nakshatra', 'dasha', 'meaning'],
  },
}

/**
 * Generate interpretation based on chart data and mood
 */
export function generateInterpretation(
  request: InterpretationRequest
): Interpretation {
  const { natal, dashas, transit, metrics, mood, length } = request
  const moodConfig = MOOD_TONES[mood] || MOOD_TONES.curious
  
  // Extract chart facts
  const facts = extractChartFacts(natal, dashas, transit, metrics)
  
  // Generate tips based on mood
  const tips = generateTips(natal, dashas, transit, mood, facts)
  
  // Generate timings if applicable
  const timings = generateTimings(dashas, transit, mood)
  
  // Generate interpretations of different lengths
  const micro = generateMicro(facts, mood, tips)
  const short = generateShort(facts, mood, tips, timings)
  const long = generateLong(facts, mood, tips, timings, natal)
  
  return {
    micro,
    short,
    long,
    facts,
    tips,
    timings: timings.length > 0 ? timings : undefined,
  }
}

/**
 * Extract key facts from chart
 */
function extractChartFacts(
  natal: NatalChart,
  dashas?: DashaPeriod[],
  transit?: TransitData[],
  metrics?: { shadbala: any; ashtakavarga: any }
): string[] {
  const facts: string[] = []
  
  // Moon facts
  const moon = natal.planets.find(p => p.name === 'Moon')
  if (moon) {
    facts.push(
      `Moon in ${moon.sign} (${moon.nakshatra} nakshatra, pada ${moon.pada})`
    )
    if (metrics?.shadbala?.[moon.name]) {
      const strength = Math.round(metrics.shadbala[moon.name].total)
      facts.push(`Moon Shadbala strength: ${strength}/100`)
    }
  }
  
  // Current dasha
  if (dashas && dashas.length > 0) {
    const current = dashas[0]
    facts.push(`${current.planet} mahadasha active until ${new Date(current.end).toLocaleDateString()}`)
  }
  
  // Weak planets
  if (metrics?.shadbala) {
    const shadbalaEntries = Object.entries(metrics.shadbala) as [string, Shadbala[string]][]
    const weakPlanet = shadbalaEntries
      .sort((a, b) => (a[1]?.total || 0) - (b[1]?.total || 0))[0]
    if (weakPlanet && weakPlanet[1] && weakPlanet[1].total < 40) {
      facts.push(`${weakPlanet[0]} is weak (strength ${Math.round(weakPlanet[1].total)}/100)`)
    }
  }
  
  // Yogas
  if (natal.yogas.length > 0) {
    facts.push(`${natal.yogas[0].name} yoga present in chart`)
  }
  
  // Transit facts
  if (transit && transit.length > 0) {
    const significantTransit = transit.find(t => Math.abs(t.diff) < 5)
    if (significantTransit) {
      facts.push(
        `${significantTransit.planet} transiting ${significantTransit.sign} (house ${significantTransit.house})`
      )
    }
  }
  
  return facts.slice(0, 3) // Return top 3 facts
}

/**
 * Generate actionable tips based on mood
 */
function generateTips(
  natal: NatalChart,
  dashas: DashaPeriod[] | undefined,
  transit: TransitData[] | undefined,
  mood: string,
  facts: string[]
): string[] {
  const tips: string[] = []
  
  if (mood === 'anxious') {
    tips.push('Avoid major conversations or decisions today')
    tips.push('Take a short calming walk between 6-7 PM')
    if (dashas && dashas[0]) {
      tips.push(`During ${dashas[0].planet} dasha, practice grounding exercises`)
    }
  } else if (mood === 'confident') {
    tips.push('Schedule high-impact actions tomorrow 08:00-10:30')
    tips.push('This is a good time to initiate new projects')
  } else if (mood === 'stuck') {
    tips.push('Break tasks into small, incremental steps')
    tips.push('Journal your thoughts during Mercury hours (9-11 AM)')
  } else if (mood === 'excited') {
    tips.push('Channel this energy into visible projects')
    tips.push('Be mindful of risks - double-check before major commitments')
  } else if (mood === 'curious') {
    tips.push('Study your nakshatra and dasha meanings')
    tips.push('Consult with an astrologer for deeper insights')
  }
  
  return tips.slice(0, 2) // Return 2 tips
}

/**
 * Generate specific timings
 */
function generateTimings(
  dashas: DashaPeriod[] | undefined,
  transit: TransitData[] | undefined,
  mood: string
): string[] {
  const timings: string[] = []
  
  if (mood === 'anxious') {
    timings.push('Avoid 10:00-14:00 for important decisions')
  } else if (mood === 'confident') {
    timings.push('Best action window: 08:00-10:30 tomorrow')
  } else if (mood === 'stuck') {
    timings.push('Reflection time: 9-11 AM (Mercury hours)')
  }
  
  return timings
}

/**
 * Generate micro interpretation (1-2 sentences)
 */
function generateMicro(
  facts: string[],
  mood: string,
  tips: string[]
): string {
  const fact1 = facts[0] || 'Your chart shows interesting patterns'
  const tip = tips[0] || 'Take time to reflect'
  
  if (mood === 'anxious') {
    return `${fact1}—avoid major conversations today. ${tip}.`
  } else if (mood === 'confident') {
    return `${fact1}—schedule high-impact actions tomorrow 08:00-10:30.`
  } else if (mood === 'stuck') {
    return `${fact1}—break tasks into small steps. ${tip}.`
  } else if (mood === 'excited') {
    return `${fact1}—channel this energy into visible projects.`
  } else {
    return `${fact1}. ${tip}.`
  }
}

/**
 * Generate short interpretation (3-5 sentences)
 */
function generateShort(
  facts: string[],
  mood: string,
  tips: string[],
  timings: string[]
): string {
  const fact1 = facts[0] || 'Your chart shows interesting patterns'
  const fact2 = facts[1] || 'Current planetary influences are significant'
  const tip1 = tips[0] || 'Take time to reflect'
  const tip2 = tips[1] || 'Trust your intuition'
  const timing = timings[0] || ''
  
  if (mood === 'anxious') {
    return `${fact1} and ${fact2}. This indicates a need for grounding and patience. ${tip1}. ${tip2}. ${timing ? `Avoid important decisions ${timing}.` : ''}`
  } else if (mood === 'confident') {
    return `${fact1} and ${fact2}. This is an excellent time for taking action. ${tip1}. ${tip2}. ${timing ? `Best timing: ${timing}.` : ''}`
  } else if (mood === 'stuck') {
    return `${fact1} and ${fact2}. Focus on incremental progress rather than big leaps. ${tip1}. ${tip2}. ${timing ? `Reflection time: ${timing}.` : ''}`
  } else if (mood === 'excited') {
    return `${fact1} and ${fact2}. Channel this energy wisely into visible projects. ${tip1}. ${tip2}. ${timing ? `Launch window: ${timing}.` : ''}`
  } else {
    return `${fact1} and ${fact2}. ${tip1}. ${tip2}. ${timing ? `Timing: ${timing}.` : ''}`
  }
}

/**
 * Generate long interpretation (detailed paragraph)
 */
function generateLong(
  facts: string[],
  mood: string,
  tips: string[],
  timings: string[],
  natal: NatalChart
): string {
  const moon = natal.planets.find(p => p.name === 'Moon')
  const fact1 = facts[0] || 'Your chart shows interesting patterns'
  const fact2 = facts[1] || 'Current planetary influences are significant'
  const fact3 = facts[2] || 'Planetary alignments are supportive'
  
  let interpretation = `${fact1}. ${fact2}. ${fact3}. `
  
  if (moon) {
    interpretation += `Your Moon at ${Math.round(moon.deg)}° ${moon.sign} (${moon.nakshatra} nakshatra, pada ${moon.pada}) indicates ${mood === 'anxious' ? 'sensitive emotional patterns' : mood === 'confident' ? 'strong intuitive abilities' : 'deep emotional awareness'}. `
  }
  
  if (natal.yogas.length > 0) {
    interpretation += `The presence of ${natal.yogas[0].name} yoga in your chart suggests ${mood === 'confident' ? 'favorable outcomes' : 'significant potential'}. `
  }
  
  if (mood === 'anxious') {
    interpretation += `During this period, focus on grounding practices and avoid making major decisions when feeling overwhelmed. ${tips.join('. ')}. ${timings.length > 0 ? `Avoid important activities ${timings[0]}.` : ''}`
  } else if (mood === 'confident') {
    interpretation += `This is an excellent time to take action on projects you've been planning. ${tips.join('. ')}. ${timings.length > 0 ? `Best timing: ${timings[0]}.` : ''}`
  } else if (mood === 'stuck') {
    interpretation += `Focus on small, incremental steps rather than trying to make big changes all at once. ${tips.join('. ')}. ${timings.length > 0 ? `Reflection time: ${timings[0]}.` : ''}`
  } else if (mood === 'excited') {
    interpretation += `Channel this energy into visible projects, but remain mindful of risks. ${tips.join('. ')}. ${timings.length > 0 ? `Launch window: ${timings[0]}.` : ''}`
  } else {
    interpretation += `${tips.join('. ')}. ${timings.length > 0 ? `Timing: ${timings[0]}.` : ''}`
  }
  
  return interpretation
}


