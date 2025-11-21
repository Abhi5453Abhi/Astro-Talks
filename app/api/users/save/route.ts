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
    
    if (!token?.sub) {
      console.error('❌ [401 ERROR] /api/users/save - Unauthorized')
      console.error('  - Reason: Token missing or token.sub is missing')
      console.error('  - Token exists:', !!token)
      console.error('  - Token.sub exists:', !!token?.sub)
      console.error('  - Available cookies:', cookieNames.join(', ') || 'none')
      
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Please ensure you are logged in',
          debug: {
            hasToken: !!token,
            hasSub: !!token?.sub,
            cookieCount: cookieNames.length,
            cookieNames: cookieNames
          }
        },
        { status: 401 }
      )
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

