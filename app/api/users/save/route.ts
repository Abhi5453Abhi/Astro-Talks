import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Log request details for debugging
    const cookies = request.headers.get('cookie') || ''
    const hasCookies = cookies.length > 0
    const cookieNames = cookies ? cookies.split(';').map(c => c.split('=')[0].trim()) : []

    console.log('🔍 [401 DEBUG] /api/users/save - Request received')
    console.log('  - Has cookies:', hasCookies)
    console.log('  - Cookie names:', cookieNames)
    console.log('  - NEXTAUTH_SECRET set:', !!process.env.NEXTAUTH_SECRET)

    // Use getToken to read JWT directly from cookies - more reliable in App Router
    let token
    try {
      const cookieValue = cookies.split('next-auth.session-token=')[1]?.split(';')[0] || ''
      if (cookieValue && hasCookies) {
        console.log('  - Cookie value preview:', cookieValue.substring(0, 50) + '...')
      }

      // Explicitly specify cookie name for getToken
      const cookieName = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: cookieName
      })

      if (!token && hasCookies && cookieNames.includes('next-auth.session-token')) {
        console.error('  - ⚠️ CRITICAL: Cookie exists but getToken returned null')
      }
    } catch (tokenError: any) {
      console.error('  - ❌ Error extracting token:', tokenError?.message || tokenError)
      console.error('  - Error code:', tokenError?.code)
    }

    console.log('  - Token extracted:', !!token)
    if (token) {
      console.log('  - Token has sub:', !!token.sub)
      console.log('  - Token keys:', Object.keys(token))
      console.log('  - Token sub value:', token.sub)
      console.log('  - Token email:', token.email)
    } else {
      console.log('  - ❌ Token is null/undefined')
      if (hasCookies) {
        console.log('  - ⚠️ Cookies present but token extraction failed')
      }
    }

    // If no token, create a guest user
    if (!token?.sub) {
      console.log('⚠️ [AUTH INFO] No session token found - creating guest user')

      // Generate a random UUID for guest users
      // We'll use crypto.randomUUID() which is available in Node.js environment
      const crypto = require('crypto')
      const guestId = crypto.randomUUID()

      token = {
        sub: guestId,
        email: `guest_${Date.now()}@example.com`,
        name: 'Guest User'
      }

      console.log('  - Generated guest ID:', guestId)
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

