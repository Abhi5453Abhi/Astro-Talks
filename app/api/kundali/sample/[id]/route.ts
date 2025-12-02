import { NextRequest, NextResponse } from 'next/server'
import { computeNatalChart } from '@/lib/kundali/calculations'
import type { BirthDetails } from '@/lib/kundali/types'

// Sample test profiles
const SAMPLE_PROFILES: Record<string, BirthDetails> = {
  '1': {
    name: 'Test User 1',
    dob: '1990-01-15',
    time: '10:30:00',
    tz: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    house_system: 'whole',
    ayanamsa: 'lahiri',
  },
  '2': {
    name: 'Test User 2',
    dob: '1985-06-20',
    time: '14:15:00',
    tz: 'Asia/Kolkata',
    lat: 19.0760,
    lon: 72.8777,
    house_system: 'whole',
    ayanamsa: 'lahiri',
  },
  '3': {
    name: 'Test User 3',
    dob: '1995-11-05',
    time: '08:00:00',
    tz: 'Asia/Kolkata',
    lat: 12.9716,
    lon: 77.5946,
    house_system: 'whole',
    ayanamsa: 'lahiri',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const profile = SAMPLE_PROFILES[id]

    if (!profile) {
      return NextResponse.json(
        { error: `Sample profile ${id} not found. Available: 1, 2, 3` },
        { status: 404 }
      )
    }

    // Compute natal chart for sample
    const natalChart = computeNatalChart(profile)

    return NextResponse.json({
      success: true,
      data: {
        profile,
        natal: natalChart,
      },
    })
  } catch (error: any) {
    console.error('❌ Sample data retrieval failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve sample data',
        message: error?.message || 'An error occurred',
      },
      { status: 500 }
    )
  }
}


