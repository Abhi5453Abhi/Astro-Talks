import { NextRequest, NextResponse } from 'next/server'
import { computeNatalChart, computeDivisions } from '@/lib/kundali/calculations'
import type { BirthDetails } from '@/lib/kundali/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      dob,
      time,
      tz,
      lat,
      lon,
      house_system = 'whole',
      ayanamsa = 'lahiri',
    } = body

    // Validate required fields
    if (!name || !dob || !time || !tz || lat === undefined || lon === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, dob, time, tz, lat, lon' },
        { status: 400 }
      )
    }

    const birth: BirthDetails = {
      name,
      dob,
      time,
      tz,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      house_system: house_system as 'whole' | 'equal' | 'placidus',
      ayanamsa: ayanamsa as 'lahiri' | 'tropical',
    }

    // Compute natal chart
    const natalChart = computeNatalChart(birth)

    // Compute divisional charts
    const divisional = {
      D9: computeDivisions(birth, 'D9', natalChart.planets, natalChart.houses).D9,
      D10: computeDivisions(birth, 'D10', natalChart.planets, natalChart.houses).D10,
    }

    return NextResponse.json({
      success: true,
      data: {
        ...natalChart,
        divisional,
      },
    })
  } catch (error: any) {
    console.error('❌ Natal chart calculation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate natal chart',
        message: error?.message || 'An error occurred during calculation',
      },
      { status: 500 }
    )
  }
}


