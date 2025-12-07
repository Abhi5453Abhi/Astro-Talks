import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || ''
    
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
    
    // If no token, use guest user ID from cookie or query param
    let userId: string
    if (!token?.sub) {
      // Check for userId in query params
      const url = new URL(request.url)
      const queryUserId = url.searchParams.get('userId')
      
      if (queryUserId) {
        userId = queryUserId
      } else {
        // Check for existing guest ID in cookie
        const guestIdCookie = cookies.split('guest-user-id=')[1]?.split(';')[0]
        
        if (guestIdCookie) {
          userId = guestIdCookie
        } else {
          // No guest ID found - return empty messages
          return NextResponse.json({
            success: true,
            messages: [],
          })
        }
      }
    } else {
      userId = token.sub
    }

    // Get all messages for the user, ordered by timestamp
    const result = await query(
      `SELECT id, role, content, timestamp, is_paid 
       FROM messages 
       WHERE user_id = $1 
       ORDER BY timestamp ASC`,
      [userId]
    )

    // Convert database format to frontend format
    const messages = result.rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: parseInt(row.timestamp.toString()),
      isPaid: row.is_paid || false,
    }))

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error('Error getting messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages', details: error.message },
      { status: 500 }
    )
  }
}

