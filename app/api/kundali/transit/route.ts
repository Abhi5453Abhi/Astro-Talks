import { NextRequest, NextResponse } from 'next/server'
import { computeTransit, computeNatalChart } from '@/lib/kundali/calculations'
import type { BirthDetails, NatalChart } from '@/lib/kundali/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { natal, birth, date } = body

    // Get natal chart
    let natalChart: NatalChart
    
    if (natal) {
      natalChart = natal
    } else if (birth) {
      natalChart = computeNatalChart(birth as BirthDetails)
    } else {
      return NextResponse.json(
        { error: 'Missing natal chart or birth details' },
        { status: 400 }
      )
    }

    // Use provided date or default to today
    const transitDate = date ? new Date(date) : new Date()

    // Compute transits
    const transits = computeTransit(natalChart, transitDate)

    // Find closest conjunctions and aspects
    const conjunctions = transits
      .filter(t => Math.abs(t.diff) < 5)
      .map(t => ({
        planet: t.planet,
        orb: Math.abs(t.diff),
        type: 'conjunction' as const,
      }))

    // Generate human summary
    const summary = generateTransitSummary(transits, conjunctions, natalChart)

    return NextResponse.json({
      success: true,
      data: {
        transits,
        conjunctions,
        date: transitDate.toISOString(),
        summary,
      },
    })
  } catch (error: any) {
    console.error('❌ Transit calculation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate transits',
        message: error?.message || 'An error occurred during calculation',
      },
      { status: 500 }
    )
  }
}

function generateTransitSummary(
  transits: any[],
  conjunctions: any[],
  natal: NatalChart
): string {
  if (conjunctions.length > 0) {
    return `${conjunctions[0].planet} is in close conjunction, affecting house ${transits.find(t => t.planet === conjunctions[0].planet)?.house}. This is a significant transit period.`
  }
  
  const significantTransit = transits.find(t => Math.abs(t.diff) < 10)
  if (significantTransit) {
    return `${significantTransit.planet} is transiting ${significantTransit.sign} in house ${significantTransit.house}. This brings focus to areas related to this house.`
  }
  
  return 'Current transits are relatively stable. Focus on ongoing projects and maintain steady progress.'
}


