import { NextResponse } from 'next/server'

// Diagnostic endpoint to check environment variables (without exposing secrets)
export async function GET() {
  const appId = process.env.CASHFREE_APP_ID
  const secretKey = process.env.CASHFREE_SECRET_KEY
  const publicAppId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID

  // Get all environment variable keys that contain CASHFREE (for debugging)
  const cashfreeEnvKeys = Object.keys(process.env).filter(key => 
    key.toUpperCase().includes('CASHFREE')
  )

  return NextResponse.json({
    hasAppId: !!appId,
    hasSecretKey: !!secretKey,
    hasPublicAppId: !!publicAppId,
    appIdLength: appId?.length || 0,
    secretKeyLength: secretKey?.length || 0,
    publicAppIdLength: publicAppId?.length || 0,
    appIdPrefix: appId ? appId.substring(0, 5) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allCashfreeKeys: cashfreeEnvKeys,
    timestamp: new Date().toISOString(),
  })
}

