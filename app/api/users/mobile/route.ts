import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Log request details for debugging
    const cookies = request.headers.get('cookie') || ''
    const hasCookies = cookies.length > 0
    const cookieNames = cookies ? cookies.split(';').map(c => c.split('=')[0].trim()) : []
    
    console.log('🔍 [401 DEBUG] /api/users/mobile - Request received')
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
        console.error('  - NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0)
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
    } else {
      console.log('  - ❌ Token is null/undefined')
      if (hasCookies) {
        console.log('  - ⚠️ Cookies present but token extraction failed')
      }
    }
    
    if (!token?.sub) {
      console.error('❌ [401 ERROR] /api/users/mobile - Unauthorized')
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
    const { mobile } = await request.json()

    // Validate mobile number (10 digits)
    if (!mobile || !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number is required' },
        { status: 400 }
      )
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(0, 10)

    // Update user mobile number
    const result = await query(
      `UPDATE users 
       SET mobile = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [cleanMobile, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      mobile: result.rows[0].mobile,
    })
  } catch (error: any) {
    console.error('Error updating mobile number:', error)
    return NextResponse.json(
      { error: 'Failed to update mobile number', details: error.message },
      { status: 500 }
    )
  }
}

