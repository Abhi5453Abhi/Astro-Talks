/**
 * Type definitions for Kundali calculations
 * Based on Vedic astrology principles with Lahiri ayanamsa
 */

export interface BirthDetails {
  name: string
  dob: string // YYYY-MM-DD
  time: string // HH:MM:SS
  tz: string // IANA timezone, e.g., "Asia/Kolkata"
  lat: number // Latitude in degrees
  lon: number // Longitude in degrees
  house_system?: 'whole' | 'equal' | 'placidus' // Default: 'whole'
  ayanamsa?: 'lahiri' | 'tropical' // Default: 'lahiri'
}

export interface PlanetPosition {
  name: string
  lon: number // Longitude in degrees (0-360)
  sign: string // Zodiac sign name
  deg: number // Degrees within sign (0-30)
  min: number // Minutes within degree
  nakshatra: string // Nakshatra name
  pada: number // Pada (1-4)
  retrograde: boolean
  dignity: string // Exalted, Debilitated, Mooltrikona, Own, Friendly, Enemy, Neutral
}

export interface House {
  num: number // House number (1-12)
  cuspLon: number // Cusp longitude in degrees
  lord: string // Ruling planet
  planets: string[] // Planets in this house
}

export interface DivisionalChart {
  D9?: { // Navamsa
    planets: PlanetPosition[]
    houses: House[]
  }
  D10?: { // Dashamsa
    planets: PlanetPosition[]
    houses: House[]
  }
}

export interface Yoga {
  name: string
  type: 'raj' | 'dhana' | 'chamatkar' | 'nara' | 'other'
  planets: string[]
  description: string
}

export interface Ashtakavarga {
  [planet: string]: {
    [house: number]: number // Points (0-8)
  }
}

export interface Shadbala {
  [planet: string]: {
    total: number // Total strength (0-100 normalized)
    components: {
      sthana: number // Positional strength
      dig: number // Directional strength
      kala: number // Temporal strength
      chesta: number // Motional strength
      naisargika: number // Natural strength
      drk: number // Aspect strength
    }
  }
}

export interface NatalChart {
  planets: PlanetPosition[]
  houses: House[]
  divisional: DivisionalChart
  yogas: Yoga[]
  ashtakavarga: Ashtakavarga
  shadbala: Shadbala
}

export interface DashaPeriod {
  planet: string
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha'
  start: string // ISO date
  end: string // ISO date
  duration: number // Days
}

export interface TransitData {
  planet: string
  currentLon: number
  natalLon: number
  diff: number // Difference in degrees
  sign: string
  house: number // House in natal chart
  aspects: Array<{
    to: string // Planet or house
    type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
    orb: number // Orb in degrees
  }>
}

export interface InterpretationRequest {
  natal: NatalChart
  dashas?: DashaPeriod[]
  transit?: TransitData[]
  metrics?: {
    shadbala: Shadbala
    ashtakavarga: Ashtakavarga
  }
  mood: 'anxious' | 'confident' | 'stuck' | 'excited' | 'curious'
  length: 'micro' | 'short' | 'long'
}

export interface Interpretation {
  micro: string // 1-2 sentences
  short: string // 3-5 sentences
  long: string // Detailed paragraph
  facts: string[] // Chart facts referenced
  tips: string[] // Actionable tips
  timings?: string[] // Specific timings if applicable
}


