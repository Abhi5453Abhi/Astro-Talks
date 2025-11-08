import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/lib/env'

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json()

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order: any = await razorpay.orders.create(orderOptions)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

