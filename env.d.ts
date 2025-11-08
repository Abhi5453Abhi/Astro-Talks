declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    OPENAI_API_KEY?: string
    RAZORPAY_KEY_ID?: string
    RAZORPAY_KEY_SECRET?: string
    NEXT_PUBLIC_RAZORPAY_KEY_ID?: string
  }
}


