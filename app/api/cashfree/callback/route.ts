import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('order_id')
    const paymentId = searchParams.get('payment_id')
    const paymentStatus = searchParams.get('payment_status')

    // Get the origin from the request URL to stay on the same domain (prevents logout)
    // This ensures we redirect to the same domain the user is on, not a different Vercel preview URL
    const requestOrigin = request.nextUrl.origin || 
                         (request.headers.get('origin') || request.headers.get('host'))
    
    let baseUrl: string
    
    if (requestOrigin) {
      // Use the request origin to stay on the same domain
      if (requestOrigin.startsWith('http://') || requestOrigin.startsWith('https://')) {
        baseUrl = requestOrigin
      } else {
        // If it's just a host, construct the URL
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        baseUrl = `${protocol}://${requestOrigin}`
      }
    } else {
      // Fallback to environment variables (prefer NEXTAUTH_URL which should be production domain)
      baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    }
    
    // Ensure HTTPS
    let httpsBaseUrl = baseUrl.replace(/^https?:\/\//, '')
    httpsBaseUrl = httpsBaseUrl.replace(/\/$/, '')
    httpsBaseUrl = `https://${httpsBaseUrl}`

    if (!orderId) {
      return NextResponse.redirect(new URL(`/?payment=error&message=Order ID missing`, httpsBaseUrl))
    }

    // Verify payment status
    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.redirect(new URL(`/?payment=error&message=Configuration error`, httpsBaseUrl))
    }

    // Determine API base URL based on mode
    const secretKeyLower = secretKey.toLowerCase()
    const appIdLower = appId.toLowerCase()
    const isProduction = 
      (secretKeyLower.includes('_prod_') || secretKeyLower.includes('production')) ||
      (appId.startsWith('CF') && !appIdLower.includes('test') && !appIdLower.includes('sandbox')) ||
      (!secretKeyLower.includes('test') && !secretKeyLower.includes('sandbox') && !appIdLower.includes('test') && !appIdLower.includes('sandbox'))
    const apiBaseUrl = isProduction ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com'

    // Get order details from Cashfree
    const response = await fetch(`${apiBaseUrl}/pg/orders/${orderId}`, {
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
      return NextResponse.redirect(new URL(`/?payment=error&message=${encodeURIComponent(data.message || 'Payment verification failed')}`, httpsBaseUrl))
    }

    // Check payment status
    const status = data.payment_status || data.order_status || paymentStatus
    
    if (status === 'PAID' || status === 'SUCCESS') {
      // Redirect to success page with order details - use relative path to stay on same domain
      return NextResponse.redirect(new URL(`/?payment=success&order_id=${orderId}&payment_id=${data.payment_id || paymentId || ''}`, httpsBaseUrl))
    } else {
      return NextResponse.redirect(new URL(`/?payment=failed&order_id=${orderId}&status=${status}`, httpsBaseUrl))
    }
  } catch (error: any) {
    console.error('Payment callback error:', error)
    // Get origin from request URL for error redirect
    const requestOrigin = request.nextUrl.origin || 
                         (request.headers.get('origin') || request.headers.get('host'))
    let errorBaseUrl: string
    if (requestOrigin) {
      if (requestOrigin.startsWith('http://') || requestOrigin.startsWith('https://')) {
        errorBaseUrl = requestOrigin
      } else {
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        errorBaseUrl = `${protocol}://${requestOrigin}`
      }
    } else {
      errorBaseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    }
    let httpsErrorUrl = errorBaseUrl.replace(/^https?:\/\//, '')
    httpsErrorUrl = httpsErrorUrl.replace(/\/$/, '')
    httpsErrorUrl = `https://${httpsErrorUrl}`
    return NextResponse.redirect(new URL(`/?payment=error&message=${encodeURIComponent(error.message)}`, httpsErrorUrl))
  }
}

