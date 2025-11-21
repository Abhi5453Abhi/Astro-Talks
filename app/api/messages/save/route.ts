import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Log request details for debugging
    const cookies = request.headers.get('cookie') || ''
    const hasCookies = cookies.length > 0
    const cookieNames = cookies ? cookies.split(';').map(c => c.split('=')[0].trim()) : []
    
    console.log('🔍 [401 DEBUG] /api/messages/save - Request received')
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
    } else {
      console.log('  - ❌ Token is null/undefined')
      if (hasCookies) {
        console.log('  - ⚠️ Cookies present but token extraction failed')
      }
    }
    
    if (!token?.sub) {
      console.error('❌ [401 ERROR] /api/messages/save - Unauthorized')
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
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Save messages in batch
    const savedMessages = []

    for (const message of messages) {
      const { id, role, content, timestamp, isPaid } = message

      if (!id || !role || !content || !timestamp) {
        console.warn('Skipping invalid message:', message)
        continue
      }

      try {
        const result = await query(
          `INSERT INTO messages (id, user_id, role, content, timestamp, is_paid)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) 
           DO UPDATE SET
             content = EXCLUDED.content,
             timestamp = EXCLUDED.timestamp,
             is_paid = EXCLUDED.is_paid
           RETURNING *`,
          [
            id,
            userId,
            role,
            content,
            timestamp,
            isPaid || false,
          ]
        )
        savedMessages.push(result.rows[0])
      } catch (error) {
        console.error('Error saving message:', error, message)
        // Continue with other messages
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedMessages.length,
      messages: savedMessages,
    })
  } catch (error: any) {
    console.error('Error saving messages:', error)
    return NextResponse.json(
      { error: 'Failed to save messages', details: error.message },
      { status: 500 }
    )
  }
}

