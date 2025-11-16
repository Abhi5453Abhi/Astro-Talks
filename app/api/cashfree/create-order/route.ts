import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', orderId } = await request.json()

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
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

    // Generate order ID if not provided
    const order_id = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Convert amount to paise (smallest currency unit)
    const order_amount = Math.round(amount * 100)

    // Create order using Cashfree API
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        order_id,
        order_amount,
        order_currency: currency,
        order_meta: {
          return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cashfree/callback?order_id={order_id}`,
          notify_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cashfree/webhook`,
        },
        customer_details: {
          customer_id: `customer_${Date.now()}`,
          customer_phone: '',
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cashfree order creation error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to create order' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      amount: data.order_amount,
      currency: data.order_currency,
    })
  } catch (error: any) {
    console.error('Cashfree order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}

