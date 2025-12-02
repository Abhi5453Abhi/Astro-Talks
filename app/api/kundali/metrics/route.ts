import { NextRequest, NextResponse } from 'next/server'
import { computeShadbala, computeAshtakavarga, computeNatalChart } from '@/lib/kundali/calculations'
import type { BirthDetails, NatalChart } from '@/lib/kundali/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { natal, birth } = body

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

    // Compute metrics
    const shadbala = computeShadbala(natalChart.planets, natalChart.houses)
    const ashtakavarga = computeAshtakavarga(natalChart.planets, natalChart.houses)

    // Calculate planet strengths (normalized 0-100)
    const planetStrengths: Record<string, number> = {}
    Object.entries(shadbala).forEach(([planet, data]: [string, any]) => {
      planetStrengths[planet] = Math.round(data.total)
    })

    // Get top 3 strongest and weakest planets
    const sortedPlanets = Object.entries(planetStrengths)
      .sort((a, b) => b[1] - a[1])
    
    const top3 = sortedPlanets.slice(0, 3).map(([name, strength]) => ({ name, strength }))
    const weakest = sortedPlanets[sortedPlanets.length - 1]
      ? { name: sortedPlanets[sortedPlanets.length - 1][0], strength: sortedPlanets[sortedPlanets.length - 1][1] }
      : null

    // Prepare heatmap data (ashtakavarga points per house)
    const heatmapData: Record<number, number> = {}
    for (let i = 1; i <= 12; i++) {
      let totalPoints = 0
      Object.values(ashtakavarga).forEach((housePoints: any) => {
        totalPoints += housePoints[i] || 0
      })
      heatmapData[i] = totalPoints
    }

    return NextResponse.json({
      success: true,
      data: {
        shadbala,
        ashtakavarga,
        planetStrengths,
        top3,
        weakest,
        heatmapData,
      },
    })
  } catch (error: any) {
    console.error('❌ Metrics calculation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        message: error?.message || 'An error occurred during calculation',
      },
      { status: 500 }
    )
  }
}


