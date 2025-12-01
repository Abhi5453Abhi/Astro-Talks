import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, astrologerName, astrologerImage, startTime, endTime, messageCount, isFreeChat } = body

    // Get user ID from token (similar to messages/save)
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

    // If no token, use provided userId or default
    let userId = body.userId || 'default-user'
    if (!token?.sub) {
      // Generate a consistent guest ID based on localStorage or use provided userId
      // For now, use the provided userId or default
      console.log('⚠️ No session token found - using provided userId:', userId)
    } else {
      userId = token.sub
      console.log('✅ Using token.sub as userId:', userId)
    }
    
    console.log('💾 Saving chat session:', {
      sessionId,
      userId,
      astrologerName,
      isFreeChat,
      messageCount,
    })

    if (!sessionId || !astrologerName || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, astrologerName, startTime' },
        { status: 400 }
      )
    }

    // Save or update chat session
    const result = await query(
      `INSERT INTO chat_sessions (id, user_id, astrologer_name, astrologer_image, start_time, end_time, message_count, is_free_chat, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET
         end_time = EXCLUDED.end_time,
         message_count = EXCLUDED.message_count,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        sessionId,
        userId,
        astrologerName,
        astrologerImage || null,
        new Date(startTime).toISOString(),
        endTime ? new Date(endTime).toISOString() : null,
        messageCount || 0,
        isFreeChat || false,
      ]
    )

    return NextResponse.json({
      success: true,
      session: result.rows[0],
    })
  } catch (error: any) {
    console.error('Error saving chat session:', error)
    
    // If table doesn't exist, return success but log warning
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      console.warn('chat_sessions table does not exist. Please run the migration SQL.')
      return NextResponse.json({
        success: true,
        warning: 'chat_sessions table does not exist',
      })
    }

    return NextResponse.json(
      { error: 'Failed to save chat session', details: error.message },
      { status: 500 }
    )
  }
}

