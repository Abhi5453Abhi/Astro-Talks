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
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

