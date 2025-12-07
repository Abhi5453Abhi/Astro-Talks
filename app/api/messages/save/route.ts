import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
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
    
    // Parse request body once
    const body = await request.json()
    const { messages, userId: requestUserId } = body

    // If no token, create or use a guest user
    let userId: string
    if (!token?.sub) {
      if (requestUserId) {
        userId = requestUserId
      } else {
        // Check for existing guest ID in cookie
        const guestIdCookie = cookies.split('guest-user-id=')[1]?.split(';')[0]
        
        if (guestIdCookie) {
          userId = guestIdCookie
        } else {
          // Generate a new guest ID
          const crypto = require('crypto')
          userId = crypto.randomUUID()
        }
      }
    } else {
      userId = token.sub
    }

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

