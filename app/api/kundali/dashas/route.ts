import { NextRequest, NextResponse } from 'next/server'
import { computeVimshottari, computePlanetaryPositions } from '@/lib/kundali/calculations'
import type { BirthDetails } from '@/lib/kundali/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Accept either birth details or natal payload
    let birth: BirthDetails
    
    if (body.birth) {
      birth = body.birth
    } else if (body.dob && body.time && body.tz && body.lat !== undefined && body.lon !== undefined) {
      birth = {
        name: body.name || 'User',
        dob: body.dob,
        time: body.time,
        tz: body.tz,
        lat: parseFloat(body.lat),
        lon: parseFloat(body.lon),
        house_system: body.house_system || 'whole',
        ayanamsa: body.ayanamsa || 'lahiri',
      }
    } else {
      return NextResponse.json(
        { error: 'Missing birth details or natal payload' },
        { status: 400 }
      )
    }

    // Compute planetary positions to get Moon for dasha calculation
    const planets = computePlanetaryPositions(birth)
    
    // Compute Vimshottari dasha
    const dashas = computeVimshottari(birth, planets)

    // Generate antardashas for current mahadasha
    const antardashas: any[] = []
    if (dashas.length > 0) {
      const currentMahadasha = dashas[0]
      const antardashaSequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
      const antardashaDurations = [0.7, 2, 0.6, 1, 0.7, 1.8, 1.6, 1.9, 1.7] // Years
      
      const mahadashaStart = new Date(currentMahadasha.start)
      let antardashaDate = new Date(mahadashaStart)
      const mahadashaPlanetIndex = antardashaSequence.indexOf(currentMahadasha.planet)
      
      for (let i = 0; i < 9; i++) {
        const antardashaIndex = (mahadashaPlanetIndex + i) % 9
        const planet = antardashaSequence[antardashaIndex]
        const durationYears = antardashaDurations[antardashaIndex]
        
        const start = new Date(antardashaDate)
        const end = new Date(antardashaDate)
        end.setFullYear(end.getFullYear() + durationYears)
        
        antardashas.push({
          planet,
          type: 'antardasha',
          start: start.toISOString(),
          end: end.toISOString(),
          duration: durationYears * 365,
          parent: currentMahadasha.planet,
        })
        
        antardashaDate = end
        if (antardashaDate > new Date(currentMahadasha.end)) break
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        mahadashas: dashas,
        antardashas,
        current: dashas[0] || null,
      },
    })
  } catch (error: any) {
    console.error('❌ Dasha calculation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate dashas',
        message: error?.message || 'An error occurred during calculation',
      },
      { status: 500 }
    )
  }
}


