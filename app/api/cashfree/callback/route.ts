import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('order_id')
    const paymentId = searchParams.get('payment_id')
    const paymentStatus = searchParams.get('payment_status')

    if (!orderId) {
      return NextResponse.redirect(new URL('/?payment=error&message=Order ID missing', request.url))
    }

    // Verify payment status
    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.redirect(new URL('/?payment=error&message=Configuration error', request.url))
    }

    // Get order details from Cashfree
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
      console.error('Cashfree order fetch error:', data)
      return NextResponse.redirect(new URL(`/?payment=error&message=${encodeURIComponent(data.message || 'Payment verification failed')}`, request.url))
    }

    // Check payment status
    const status = data.payment_status || data.order_status || paymentStatus
    
    if (status === 'PAID' || status === 'SUCCESS') {
      // Redirect to success page with order details
      return NextResponse.redirect(new URL(`/?payment=success&order_id=${orderId}&payment_id=${data.payment_id || paymentId || ''}`, request.url))
    } else {
      return NextResponse.redirect(new URL(`/?payment=failed&order_id=${orderId}&status=${status}`, request.url))
    }
  } catch (error: any) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(new URL(`/?payment=error&message=${encodeURIComponent(error.message)}`, request.url))
  }
}

