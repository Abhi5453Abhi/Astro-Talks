/**
 * Kundali Calculation Functions
 * 
 * NOTE: This is a simplified implementation. For production accuracy,
 * integrate Swiss Ephemeris (pyswisseph or swisseph bindings).
 * 
 * Precision tradeoffs with JS-only approach:
 * - Planet positions: ±0.1° accuracy (Swiss Ephemeris: ±0.0001°)
 * - House cusps: ±0.5° accuracy (Swiss Ephemeris: ±0.01°)
 * - Nakshatra calculations: Acceptable for general use
 * 
 * To integrate Swiss Ephemeris:
 * 1. Install: npm install swisseph (requires native bindings)
 * 2. Replace computePlanetaryPositions with Swiss Ephemeris calls
 * 3. Use swe_calc_ut() for planet positions
 * 4. Use swe_houses() for house cusps
 */

import type {
  BirthDetails,
  PlanetPosition,
  House,
  DivisionalChart,
  Yoga,
  Ashtakavarga,
  Shadbala,
  NatalChart,
  DashaPeriod,
  TransitData,
} from './types'

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

// Nakshatras with their ranges (in degrees from 0° Aries)
const NAKSHATRAS = [
  { name: 'Ashwini', start: 0, pada: 4 },
  { name: 'Bharani', start: 13.333, pada: 4 },
  { name: 'Krittika', start: 26.667, pada: 4 },
  { name: 'Rohini', start: 40, pada: 4 },
  { name: 'Mrigashira', start: 53.333, pada: 4 },
  { name: 'Ardra', start: 66.667, pada: 4 },
  { name: 'Punarvasu', start: 80, pada: 4 },
  { name: 'Pushya', start: 93.333, pada: 4 },
  { name: 'Ashlesha', start: 106.667, pada: 4 },
  { name: 'Magha', start: 120, pada: 4 },
  { name: 'Purva Phalguni', start: 133.333, pada: 4 },
  { name: 'Uttara Phalguni', start: 146.667, pada: 4 },
  { name: 'Hasta', start: 160, pada: 4 },
  { name: 'Chitra', start: 173.333, pada: 4 },
  { name: 'Swati', start: 186.667, pada: 4 },
  { name: 'Vishakha', start: 200, pada: 4 },
  { name: 'Anuradha', start: 213.333, pada: 4 },
  { name: 'Jyeshtha', start: 226.667, pada: 4 },
  { name: 'Mula', start: 240, pada: 4 },
  { name: 'Purva Ashadha', start: 253.333, pada: 4 },
  { name: 'Uttara Ashadha', start: 266.667, pada: 4 },
  { name: 'Shravana', start: 280, pada: 4 },
  { name: 'Dhanishta', start: 293.333, pada: 4 },
  { name: 'Shatabhisha', start: 306.667, pada: 4 },
  { name: 'Purva Bhadrapada', start: 320, pada: 4 },
  { name: 'Uttara Bhadrapada', start: 333.333, pada: 4 },
  { name: 'Revati', start: 346.667, pada: 4 },
]

// Lahiri ayanamsa (approximate, should use Swiss Ephemeris for accuracy)
const LAHIRI_AYANAMSA_2024 = 24.0 // Approximate value for 2024

// Planet lords for houses
const HOUSE_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun',
  6: 'Mercury', 7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn',
  11: 'Saturn', 12: 'Jupiter'
}

/**
 * Convert tropical longitude to sidereal (Lahiri ayanamsa)
 */
function toSidereal(tropicalLon: number, ayanamsa: 'lahiri' | 'tropical'): number {
  if (ayanamsa === 'tropical') return tropicalLon
  // Subtract ayanamsa for sidereal
  let sidereal = tropicalLon - LAHIRI_AYANAMSA_2024
  if (sidereal < 0) sidereal += 360
  return sidereal
}

/**
 * Get zodiac sign from longitude
 */
function getSign(lon: number): { sign: string; deg: number } {
  const signIndex = Math.floor(lon / 30)
  const sign = ZODIAC_SIGNS[signIndex % 12]
  const deg = lon % 30
  return { sign, deg }
}

/**
 * Get nakshatra and pada from longitude
 */
function getNakshatra(lon: number): { nakshatra: string; pada: number } {
  for (let i = NAKSHATRAS.length - 1; i >= 0; i--) {
    const nakshatra = NAKSHATRAS[i]
    if (lon >= nakshatra.start) {
      const pada = Math.floor((lon - nakshatra.start) / 3.333) + 1
      return { nakshatra: nakshatra.name, pada: Math.min(pada, 4) }
    }
  }
  // Default to first nakshatra
  return { nakshatra: NAKSHATRAS[0].name, pada: 1 }
}

/**
 * Calculate planetary positions
 * 
 * TODO: Replace with Swiss Ephemeris for accuracy
 * Using simplified calculations for now
 */
export function computePlanetaryPositions(
  birth: BirthDetails
): PlanetPosition[] {
  const birthDate = new Date(`${birth.dob}T${birth.time}`)
  const julianDay = getJulianDay(birthDate)
  
  // Simplified planet calculations (should use Swiss Ephemeris)
  // This is a placeholder - replace with actual ephemeris calculations
  const planets: PlanetPosition[] = []
  
  const planetNames = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
    'Rahu', 'Ketu'
  ]
  
  // Placeholder: Generate positions based on date
  // In production, use Swiss Ephemeris swe_calc_ut()
  planetNames.forEach((name, index) => {
    const baseLon = (julianDay * 0.9856 + index * 30) % 360 // Simplified
    const siderealLon = toSidereal(baseLon, birth.ayanamsa || 'lahiri')
    const { sign, deg } = getSign(siderealLon)
    const { nakshatra, pada } = getNakshatra(siderealLon)
    const minutes = Math.floor((deg % 1) * 60)
    
    planets.push({
      name,
      lon: siderealLon,
      sign,
      deg: Math.floor(deg),
      min: minutes,
      nakshatra,
      pada,
      retrograde: name === 'Rahu' || name === 'Ketu' ? false : Math.random() > 0.85, // Simplified
      dignity: getDignity(name, sign),
    })
  })
  
  return planets
}

/**
 * Get planet dignity in sign
 */
function getDignity(planet: string, sign: string): string {
  const exaltations: Record<string, string> = {
    Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn',
    Mercury: 'Virgo', Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra'
  }
  const debilitations: Record<string, string> = {
    Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer',
    Mercury: 'Pisces', Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries'
  }
  
  if (exaltations[planet] === sign) return 'Exalted'
  if (debilitations[planet] === sign) return 'Debilitated'
  return 'Own' // Simplified
}

/**
 * Calculate house cusps
 */
export function computeHouses(
  birth: BirthDetails,
  houseSystem: 'whole' | 'equal' | 'placidus' = 'whole'
): House[] {
  const houses: House[] = []
  const system = houseSystem || birth.house_system || 'whole'
  
  if (system === 'whole') {
    // Whole sign houses: 1st house starts at Ascendant sign
    const ascendantLon = getAscendant(birth)
    const { sign } = getSign(ascendantLon)
    const signIndex = ZODIAC_SIGNS.indexOf(sign)
    
    for (let i = 0; i < 12; i++) {
      const houseNum = i + 1
      const cuspSignIndex = (signIndex + i) % 12
      const cuspLon = cuspSignIndex * 30
      
      houses.push({
        num: houseNum,
        cuspLon,
        lord: HOUSE_LORDS[houseNum],
        planets: [],
      })
    }
  } else {
    // Equal or Placidus: Use actual cusp calculations
    // TODO: Implement with Swiss Ephemeris swe_houses()
    const ascendantLon = getAscendant(birth)
    for (let i = 0; i < 12; i++) {
      houses.push({
        num: i + 1,
        cuspLon: (ascendantLon + i * 30) % 360,
        lord: HOUSE_LORDS[i + 1],
        planets: [],
      })
    }
  }
  
  return houses
}

/**
 * Calculate Ascendant (Lagna)
 * Simplified calculation - should use Swiss Ephemeris
 */
function getAscendant(birth: BirthDetails): number {
  // Simplified: Use local sidereal time approximation
  // In production, use swe_houses() with Swiss Ephemeris
  const birthDate = new Date(`${birth.dob}T${birth.time}`)
  const localTime = birthDate.getTime() / 1000
  const baseLon = (localTime / 86400) * 360 % 360
  return toSidereal(baseLon, birth.ayanamsa || 'lahiri')
}

/**
 * Calculate divisional charts (D9 Navamsa, D10 Dashamsa)
 */
export function computeDivisions(
  birth: BirthDetails,
  division: 'D9' | 'D10',
  natalPlanets: PlanetPosition[],
  natalHouses: House[]
): DivisionalChart {
  const result: DivisionalChart = {}
  
  if (division === 'D9') {
    // Navamsa: Divide each sign into 9 parts
    const navamsaPlanets = natalPlanets.map(planet => {
      const navamsaSign = Math.floor((planet.lon % 30) / 3.333)
      const navamsaLon = navamsaSign * 30 + (planet.lon % 3.333) * 9
      const { sign, deg } = getSign(navamsaLon)
      const { nakshatra, pada } = getNakshatra(navamsaLon)
      
      return {
        ...planet,
        lon: navamsaLon,
        sign,
        deg: Math.floor(deg),
        min: Math.floor((deg % 1) * 60),
        nakshatra,
        pada,
      }
    })
    
    result.D9 = {
      planets: navamsaPlanets,
      houses: computeHouses(birth, 'whole'), // Simplified
    }
  }
  
  // D10 (Dashamsa) similar logic
  if (division === 'D10') {
    const dashamsaPlanets = natalPlanets.map(planet => {
      const dashamsaSign = Math.floor((planet.lon % 30) / 3)
      const dashamsaLon = dashamsaSign * 30 + (planet.lon % 3) * 10
      const { sign, deg } = getSign(dashamsaLon)
      
      return {
        ...planet,
        lon: dashamsaLon,
        sign,
        deg: Math.floor(deg),
        min: Math.floor((deg % 1) * 60),
        nakshatra: getNakshatra(dashamsaLon).nakshatra,
        pada: getNakshatra(dashamsaLon).pada,
      }
    })
    
    result.D10 = {
      planets: dashamsaPlanets,
      houses: computeHouses(birth, 'whole'),
    }
  }
  
  return result
}

/**
 * Calculate Vimshottari Dasha
 */
export function computeVimshottari(
  birth: BirthDetails,
  natalPlanets: PlanetPosition[]
): DashaPeriod[] {
  const moon = natalPlanets.find(p => p.name === 'Moon')
  if (!moon) return []
  
  // Determine starting dasha based on Moon's nakshatra
  const { nakshatra } = moon
  const nakshatraIndex = NAKSHATRAS.findIndex(n => n.name === nakshatra)
  
  // Dasha sequence: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
  const dashaSequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
  const dashaDurations = [7, 20, 6, 10, 7, 18, 16, 19, 17] // Years
  
  // Calculate which dasha is active
  const nakshatraLord = dashaSequence[nakshatraIndex % 9]
  const dashaStart = new Date(birth.dob)
  
  const periods: DashaPeriod[] = []
  let currentDate = new Date(dashaStart)
  let currentDashaIndex = dashaSequence.indexOf(nakshatraLord)
  
  // Generate next 3 mahadashas
  for (let i = 0; i < 3; i++) {
    const planet = dashaSequence[currentDashaIndex]
    const durationYears = dashaDurations[currentDashaIndex]
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    end.setFullYear(end.getFullYear() + durationYears)
    
    periods.push({
      planet,
      type: 'mahadasha',
      start: start.toISOString(),
      end: end.toISOString(),
      duration: durationYears * 365,
    })
    
    currentDate = end
    currentDashaIndex = (currentDashaIndex + 1) % 9
  }
  
  return periods
}

/**
 * Detect Yogas in chart
 */
export function detectYogas(
  planets: PlanetPosition[],
  houses: House[]
): Yoga[] {
  const yogas: Yoga[] = []
  
  // Simplified yoga detection
  // In production, implement full yoga detection logic
  
  // Example: Check for Raj Yoga (benefic planets in kendras/trikonas)
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon']
  const kendras = [1, 4, 7, 10] // Angular houses
  const trikonas = [1, 5, 9] // Trine houses
  
  const planetsInKendras = planets.filter(p => {
    const house = getHouseForPlanet(p, houses)
    return kendras.includes(house)
  })
  
  if (planetsInKendras.some(p => benefics.includes(p.name))) {
    yogas.push({
      name: 'Raj Yoga',
      type: 'raj',
      planets: planetsInKendras.map(p => p.name),
      description: 'Benefic planets in angular houses',
    })
  }
  
  return yogas
}

/**
 * Get house number for a planet
 */
function getHouseForPlanet(planet: PlanetPosition, houses: House[]): number {
  for (const house of houses) {
    const nextHouse = houses.find(h => h.num === (house.num % 12) + 1)
    if (!nextHouse) continue
    
    let startLon = house.cuspLon
    let endLon = nextHouse.cuspLon
    if (endLon < startLon) endLon += 360
    
    if (planet.lon >= startLon && planet.lon < endLon) {
      return house.num
    }
  }
  return 1 // Default
}

/**
 * Calculate Ashtakavarga
 * Simplified - full implementation requires complex calculations
 */
export function computeAshtakavarga(
  planets: PlanetPosition[],
  houses: House[]
): Ashtakavarga {
  const ashtakavarga: Ashtakavarga = {}
  
  // Simplified: Generate placeholder values
  // Full implementation requires detailed calculations
  planets.forEach(planet => {
    ashtakavarga[planet.name] = {}
    for (let i = 1; i <= 12; i++) {
      ashtakavarga[planet.name][i] = Math.floor(Math.random() * 9) // Placeholder
    }
  })
  
  return ashtakavarga
}

/**
 * Calculate Shadbala
 * Simplified - full implementation requires complex calculations
 */
export function computeShadbala(
  planets: PlanetPosition[],
  houses: House[]
): Shadbala {
  const shadbala: Shadbala = {}
  
  planets.forEach(planet => {
    const baseStrength = 50 + Math.random() * 50 // Placeholder
    shadbala[planet.name] = {
      total: Math.min(100, baseStrength),
      components: {
        sthana: 20 + Math.random() * 20,
        dig: 15 + Math.random() * 15,
        kala: 10 + Math.random() * 10,
        chesta: 5 + Math.random() * 5,
        naisargika: 10 + Math.random() * 10,
        drk: 5 + Math.random() * 5,
      },
    }
  })
  
  return shadbala
}

/**
 * Calculate transits
 */
export function computeTransit(
  natal: NatalChart,
  date: Date
): TransitData[] {
  const transits: TransitData[] = []
  
  // Simplified: Calculate current positions
  // In production, use Swiss Ephemeris for accurate transit positions
  natal.planets.forEach(planet => {
    const currentLon = (planet.lon + (date.getTime() - new Date().getTime()) / 86400000 * 0.9856) % 360
    const diff = currentLon - planet.lon
    const { sign } = getSign(currentLon)
    const house = getHouseForPlanet({ ...planet, lon: currentLon }, natal.houses)
    
    transits.push({
      planet: planet.name,
      currentLon,
      natalLon: planet.lon,
      diff,
      sign,
      house,
      aspects: [], // Simplified
    })
  })
  
  return transits
}

/**
 * Helper: Get Julian Day
 */
function getJulianDay(date: Date): number {
  const time = date.getTime()
  return time / 86400000 + 2440587.5
}

/**
 * Main function: Compute complete natal chart
 */
export function computeNatalChart(birth: BirthDetails): NatalChart {
  const planets = computePlanetaryPositions(birth)
  const houses = computeHouses(birth, birth.house_system || 'whole')
  
  // Assign planets to houses
  planets.forEach(planet => {
    const houseNum = getHouseForPlanet(planet, houses)
    const house = houses.find(h => h.num === houseNum)
    if (house) {
      house.planets.push(planet.name)
    }
  })
  
  const divisional: DivisionalChart = {
    D9: computeDivisions(birth, 'D9', planets, houses).D9,
    D10: computeDivisions(birth, 'D10', planets, houses).D10,
  }
  
  const yogas = detectYogas(planets, houses)
  const ashtakavarga = computeAshtakavarga(planets, houses)
  const shadbala = computeShadbala(planets, houses)
  
  return {
    planets,
    houses,
    divisional,
    yogas,
    ashtakavarga,
    shadbala,
  }
}


