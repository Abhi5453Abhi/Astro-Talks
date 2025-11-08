const warnMissing = (name: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[env] Missing environment variable: ${name}`)
  }
}

const getEnv = (name: string, options?: { required?: boolean }) => {
  const value = process.env[name]
  if (!value && options?.required) {
    throw new Error(`Environment variable ${name} is required but was not provided.`)
  }

  if (!value) {
    warnMissing(name)
  }

  return value
}

export const OPENAI_API_KEY = getEnv('OPENAI_API_KEY', { required: true })
export const RAZORPAY_KEY_ID = getEnv('RAZORPAY_KEY_ID')
export const RAZORPAY_KEY_SECRET = getEnv('RAZORPAY_KEY_SECRET')

export const publicEnv = {
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || RAZORPAY_KEY_ID,
}


