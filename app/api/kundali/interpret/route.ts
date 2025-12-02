import { NextRequest, NextResponse } from 'next/server'
import { generateInterpretation } from '@/lib/kundali/interpret'
import type { InterpretationRequest } from '@/lib/kundali/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { natal, dashas, transit, metrics, mood, length } = body

    // Validate required fields
    if (!natal) {
      return NextResponse.json(
        { error: 'Missing required field: natal chart' },
        { status: 400 }
      )
    }

    if (!mood || !['anxious', 'confident', 'stuck', 'excited', 'curious'].includes(mood)) {
      return NextResponse.json(
        { error: 'Invalid or missing mood. Must be one of: anxious, confident, stuck, excited, curious' },
        { status: 400 }
      )
    }

    const interpretationLength = length || 'short'

    const request: InterpretationRequest = {
      natal,
      dashas: dashas || undefined,
      transit: transit || undefined,
      metrics: metrics || undefined,
      mood: mood as 'anxious' | 'confident' | 'stuck' | 'excited' | 'curious',
      length: interpretationLength as 'micro' | 'short' | 'long',
    }

    // Generate interpretation
    const interpretation = generateInterpretation(request)

    return NextResponse.json({
      success: true,
      data: {
        micro: interpretation.micro,
        short: interpretation.short,
        long: interpretation.long,
        facts: interpretation.facts,
        tips: interpretation.tips,
        timings: interpretation.timings,
      },
    })
  } catch (error: any) {
    console.error('❌ Interpretation generation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate interpretation',
        message: error?.message || 'An error occurred during interpretation',
      },
      { status: 500 }
    )
  }
}


