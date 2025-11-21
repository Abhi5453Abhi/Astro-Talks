import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Log request details for debugging
    const cookies = request.headers.get('cookie') || ''
    const hasCookies = cookies.length > 0
    const cookieNames = cookies ? cookies.split(';').map(c => c.split('=')[0].trim()) : []
    
    console.log('🔍 [401 DEBUG] /api/users/get - Request received')
    console.log('  - Has cookies:', hasCookies)
    console.log('  - Cookie names:', cookieNames)
    console.log('  - NEXTAUTH_SECRET set:', !!process.env.NEXTAUTH_SECRET)
    
    // Use getToken to read JWT directly from cookies - more reliable in App Router
    let token
    try {
      // Log the actual cookie value (first 50 chars for security)
      const cookieValue = cookies.split('next-auth.session-token=')[1]?.split(';')[0] || ''
      if (cookieValue) {
        console.log('  - Cookie value preview:', cookieValue.substring(0, 50) + '...')
        console.log('  - Cookie value length:', cookieValue.length)
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
      
      console.log('  - Cookie name used:', cookieName)
      
      // If token is null but cookie exists, log more details
      if (!token && hasCookies && cookieNames.includes('next-auth.session-token')) {
        console.error('  - ⚠️ CRITICAL: Cookie exists but getToken returned null')
        console.error('  - NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0)
        console.error('  - Request URL:', request.url)
        console.error('  - Request method:', request.method)
      }
    } catch (tokenError: any) {
      console.error('  - ❌ Error extracting token:', tokenError?.message || tokenError)
      console.error('  - Token error details:', {
        name: tokenError?.name,
        message: tokenError?.message,
        code: tokenError?.code,
        stack: tokenError?.stack?.split('\n').slice(0, 3).join('\n')
      })
    }
    
    console.log('  - Token extracted:', !!token)
    if (token) {
      console.log('  - Token has sub:', !!token.sub)
      console.log('  - Token keys:', Object.keys(token))
      console.log('  - Token sub value:', token.sub)
    } else {
      console.log('  - ❌ Token is null/undefined')
      if (hasCookies) {
        console.log('  - ⚠️ Cookies present but token extraction failed - possible issues:')
        console.log('    1. NEXTAUTH_SECRET mismatch')
        console.log('    2. Token expired or invalid')
        console.log('    3. Cookie name mismatch')
      }
    }
    
    if (!token?.sub) {
      console.error('❌ [401 ERROR] /api/users/get - Unauthorized')
      console.error('  - Reason: Token missing or token.sub is missing')
      console.error('  - Token exists:', !!token)
      console.error('  - Token.sub exists:', !!token?.sub)
      console.error('  - Available cookies:', cookieNames.join(', ') || 'none')
      
      return NextResponse.json(
        { 
          error: 'Unauthorized',
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

