import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user profile from database
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const dbUser = result.rows[0]

    // Convert database format to frontend format
    const userProfile = {
      name: dbUser.name,
      dateOfBirth: dbUser.date_of_birth,
      birthTime: dbUser.birth_time || undefined,
      gender: dbUser.gender || undefined,
      languages: dbUser.languages || [],
      zodiacSign: dbUser.zodiac_sign || undefined,
      placeOfBirth: dbUser.place_of_birth || undefined,
      mobile: dbUser.mobile || undefined,
    }

    return NextResponse.json({
      success: true,
      user: userProfile,
    })
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return NextResponse.json(
      { error: 'Failed to get user profile', details: error.message },
      { status: 500 }
    )
  }
}

