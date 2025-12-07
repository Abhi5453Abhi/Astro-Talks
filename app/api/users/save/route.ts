import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    // If no token, create a guest user
    if (!token?.sub) {
      // Generate a random UUID for guest users
      const crypto = require('crypto')
      const guestId = crypto.randomUUID()

      token = {
        sub: guestId,
        email: `guest_${Date.now()}@example.com`,
        name: 'Guest User'
      }
    }


    const userId = token.sub
    const userEmail = token.email as string | undefined
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
        userEmail || null,
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

