import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Use getToken to read JWT directly from cookies
    let token
    try {
      const cookieName = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: cookieName
      })
    } catch (tokenError: any) {
      console.error('Error extracting token:', tokenError?.message || tokenError)
    }

    if (!token?.sub) {
      return NextResponse.json({
        success: true,
        user: null
      })
    }

    const userId = token.sub

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
      id: dbUser.id, // Include user ID
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

