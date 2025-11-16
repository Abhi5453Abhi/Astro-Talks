import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: 'Cashfree credentials not configured' },
        { status: 500 }
      )
    }

    // Verify payment status using Cashfree API
    const response = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cashfree payment verification error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to verify payment' },
        { status: response.status }
      )
    }

    // Check payment status
    const paymentStatus = data.payment_status || data.order_status
    
    if (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: data.payment_id || paymentId,
        orderId: data.order_id || orderId,
        amount: data.order_amount,
        status: paymentStatus,
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment not completed',
          status: paymentStatus 
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    )
  }
}

