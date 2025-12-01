import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from token (similar to messages/get)
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

    // Use token.sub if available, otherwise fall back to query param or default
    const searchParams = request.nextUrl.searchParams
    const userId = token?.sub || searchParams.get('userId') || 'default-user'
    
    console.log('📥 Fetching sessions for userId:', userId, 'token.sub:', token?.sub, 'query param:', searchParams.get('userId'))

    // Get all chat sessions for the user, ordered by most recent first
    const result = await query(
      `SELECT * FROM chat_sessions 
       WHERE user_id = $1 
       ORDER BY start_time DESC 
       LIMIT 50`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      sessions: result.rows,
    })
  } catch (error: any) {
    console.error('Error fetching chat sessions:', error)
    
    // If table doesn't exist, return empty array
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      console.warn('chat_sessions table does not exist. Please run the migration SQL.')
      return NextResponse.json({
        success: true,
        sessions: [],
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch chat sessions', details: error.message },
      { status: 500 }
    )
  }
}

