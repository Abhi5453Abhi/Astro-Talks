import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const {
      name,
      dateOfBirth,
      birthTime,
      gender,
      languages,
      zodiacSign,
      placeOfBirth,
    } = await request.json()

    // Validate required fields
    if (!name || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Name and date of birth are required' },
        { status: 400 }
      )
    }

    // Update or insert user profile
    const result = await query(
      `INSERT INTO users (
        id, email, name, date_of_birth, birth_time, gender, 
        languages, zodiac_sign, place_of_birth, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        date_of_birth = EXCLUDED.date_of_birth,
        birth_time = EXCLUDED.birth_time,
        gender = EXCLUDED.gender,
        languages = EXCLUDED.languages,
        zodiac_sign = EXCLUDED.zodiac_sign,
        place_of_birth = EXCLUDED.place_of_birth,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        userId,
        session.user.email || null,
        name,
        dateOfBirth,
        birthTime || null,
        gender || null,
        languages || [],
        zodiacSign || null,
        placeOfBirth || null,
      ]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error: any) {
    console.error('Error saving user profile:', error)
    return NextResponse.json(
      { error: 'Failed to save user profile', details: error.message },
      { status: 500 }
    )
  }
}

