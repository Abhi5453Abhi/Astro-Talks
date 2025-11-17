import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', orderId, customerPhone } = await request.json()

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      const allCashfreeKeys = Object.keys(process.env).filter(key => 
        key.toUpperCase().includes('CASHFREE')
      )
      
      console.error('❌ Cashfree credentials missing:', {
        hasAppId: !!appId,
        hasSecretKey: !!secretKey,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        allCashfreeKeys,
        allEnvKeysCount: Object.keys(process.env).length,
      })
      
      return NextResponse.json(
        { 
          error: 'Cashfree credentials not configured',
          details: 'Please ensure CASHFREE_APP_ID and CASHFREE_SECRET_KEY are set in your Vercel environment variables for Production environment. After adding them, you MUST redeploy your application.',
          diagnostic: {
            hasAppId: !!appId,
            hasSecretKey: !!secretKey,
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
            foundCashfreeKeys: allCashfreeKeys,
          },
          troubleshooting: [
            '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
            '2. Verify CASHFREE_APP_ID and CASHFREE_SECRET_KEY are set',
            '3. Ensure they are enabled for "Production" environment',
            '4. After adding/updating, go to Deployments and click "Redeploy"',
            '5. Wait for deployment to complete before testing again',
          ],
        },
        { status: 500 }
      )
    }

    // Log credential info (without exposing secret)
    console.log('Cashfree credentials check:', {
      appIdLength: appId?.length,
      secretKeyLength: secretKey?.length,
      appIdPrefix: appId?.substring(0, 5),
    })

    // Determine if we're in sandbox or production mode
    // Check both appId and secretKey for production indicators
    // Production secret keys typically contain 'prod' or 'production'
    // Sandbox secret keys typically contain 'test' or 'sandbox'
    const secretKeyLower = secretKey.toLowerCase()
    const appIdLower = appId.toLowerCase()
    
    const isProduction = 
      // Check secret key for production indicators
      (secretKeyLower.includes('_prod_') || secretKeyLower.includes('production')) ||
      // Check appId for production indicators (starts with CF or doesn't contain test/sandbox)
      (appId.startsWith('CF') && !appIdLower.includes('test') && !appIdLower.includes('sandbox')) ||
      // If secret key doesn't contain test/sandbox and appId doesn't contain test/sandbox, assume production
      (!secretKeyLower.includes('test') && 
       !secretKeyLower.includes('sandbox') && 
       !appIdLower.includes('test') && 
       !appIdLower.includes('sandbox'))
    
    const mode = isProduction ? 'production' : 'sandbox'
    
    // Use appropriate API endpoint based on mode
    const apiBaseUrl = isProduction 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com'
    
    console.log('Cashfree API configuration:', {
      mode,
      apiBaseUrl,
      isProduction,
    })

    // Generate order ID if not provided
    const order_id = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Convert amount to paise (smallest currency unit)
    const order_amount = Math.round(amount * 100)

    // Validate and format phone number
    // Cashfree requires a 10-digit Indian phone number
    let phoneNumber = customerPhone || '9999999999' // Default fallback
    
    // Remove any non-digit characters
    phoneNumber = phoneNumber.replace(/\D/g, '')
    
    // Ensure it's 10 digits (remove country code if present)
    if (phoneNumber.length > 10) {
      phoneNumber = phoneNumber.slice(-10)
    }
    
    // If still not 10 digits, use default
    if (phoneNumber.length !== 10) {
      phoneNumber = '9999999999'
    }

    // Get base URL - Cashfree requires HTTPS URLs
    let baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'NEXTAUTH_URL or VERCEL_URL must be set' },
        { status: 500 }
      )
    }
    
    // Ensure HTTPS (required by Cashfree)
    // Remove any existing protocol
    baseUrl = baseUrl.replace(/^https?:\/\//, '')
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, '')
    // Always prepend https://
    const httpsBaseUrl = `https://${baseUrl}`
    
    const returnUrl = `${httpsBaseUrl}/api/cashfree/callback?order_id={order_id}`
    const notifyUrl = `${httpsBaseUrl}/api/cashfree/webhook`
    
    console.log('Cashfree URLs:', {
      originalBaseUrl: process.env.NEXTAUTH_URL || process.env.VERCEL_URL,
      httpsBaseUrl,
      returnUrl,
      notifyUrl,
    })

    // Create order using Cashfree API
    console.log('Creating Cashfree order:', {
      url: `${apiBaseUrl}/pg/orders`,
      order_id,
      order_amount,
      order_currency: currency,
    })
    
    const response = await fetch(`${apiBaseUrl}/pg/orders`, {
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
          return_url: returnUrl,
          notify_url: notifyUrl,
        },
        customer_details: {
          customer_id: `customer_${Date.now()}`,
          customer_phone: phoneNumber,
        },
      }),
    })

    const orderData = await response.json()

    if (!response.ok) {
      console.error('Cashfree order creation error:', {
        status: response.status,
        statusText: response.statusText,
        error: JSON.stringify(orderData, null, 2),
        apiBaseUrl,
        mode,
      })
      
      // Provide more specific error messages
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Authentication failed. Please check your Cashfree credentials.',
            details: 'Make sure CASHFREE_APP_ID and CASHFREE_SECRET_KEY are correct and match the environment (sandbox/production)',
            mode,
          },
          { status: response.status }
        )
      }
      
      return NextResponse.json(
        { 
          error: orderData.message || 'Failed to create order',
          details: orderData,
          mode,
        },
        { status: response.status }
      )
    }

    console.log('Cashfree order created successfully:', JSON.stringify(orderData, null, 2))

    // Check if payment_session_id is already in the order response (some API versions return it)
    if (orderData.payment_session_id) {
      console.log('Payment session ID found in order response:', orderData.payment_session_id)
      return NextResponse.json({
        orderId: orderData.order_id,
        paymentSessionId: orderData.payment_session_id,
        amount: orderData.order_amount,
        currency: orderData.order_currency,
        mode: mode, // Pass mode to frontend to ensure consistency
      })
    }

    // If payment_session_id is not in order response, create a payment session
    // Cashfree requires a separate API call to get payment_session_id
    console.log('Creating payment session for order:', orderData.order_id)
    console.log('Using API base URL:', apiBaseUrl)
    
    const sessionResponse = await fetch(`${apiBaseUrl}/pg/orders/${orderData.order_id}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        payment_method: {
          card: {
            channel: 'link',
          },
          upi: {
            channel: 'link',
          },
          netbanking: {
            channel: 'link',
          },
        },
      }),
    })

    const sessionData = await sessionResponse.json()
    console.log('Payment session response:', JSON.stringify(sessionData, null, 2))

    if (!sessionResponse.ok) {
      console.error('Cashfree payment session creation error:', JSON.stringify(sessionData, null, 2))
      return NextResponse.json(
        { error: sessionData.message || 'Failed to create payment session', details: sessionData },
        { status: sessionResponse.status }
      )
    }

    // Check for payment_session_id in various possible field names
    const paymentSessionId = sessionData.payment_session_id || 
                            sessionData.paymentSessionId || 
                            sessionData.session_id ||
                            sessionData.sessionId

    if (!paymentSessionId) {
      console.error('Payment session ID not found in response. Full response:', JSON.stringify(sessionData, null, 2))
      return NextResponse.json(
        { error: 'Payment session ID not found in response', details: sessionData },
        { status: 500 }
      )
    }

    console.log('Payment session created successfully:', paymentSessionId)

    return NextResponse.json({
      orderId: orderData.order_id,
      paymentSessionId: paymentSessionId,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      mode: mode, // Pass mode to frontend to ensure consistency
    })
  } catch (error: any) {
    console.error('Cashfree order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}

