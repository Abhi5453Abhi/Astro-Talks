import { NextRequest, NextResponse } from 'next/server'
import { generateDailyHoroscope } from '@/lib/openai'
import { getZodiacSign } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { userProfile, referenceDate } = await request.json()

    if (!userProfile?.name || !userProfile?.dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required user profile fields (name, dateOfBirth).' },
        { status: 400 }
      )
    }

    const zodiacSign = userProfile.zodiacSign || getZodiacSign(userProfile.dateOfBirth)
    const language = userProfile.languages?.[0] ?? 'english'

    const horoscope = await generateDailyHoroscope({
      name: userProfile.name,
      dateOfBirth: userProfile.dateOfBirth,
      birthTime: userProfile.birthTime,
      placeOfBirth: userProfile.placeOfBirth,
      gender: userProfile.gender,
      zodiacSign,
      referenceDate: referenceDate || new Date().toISOString().split('T')[0],
      language,
    })

    return NextResponse.json(horoscope)
  } catch (error) {
    console.error('❌ Daily horoscope generation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate horoscope',
        message: 'The stars are a bit cloudy right now. Please try again shortly.',
      },
      { status: 500 }
    )
  }
}




