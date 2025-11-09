'use client'

import { signIn } from 'next-auth/react'

interface GoogleSignInButtonProps {
  className?: string
}

export default function GoogleSignInButton({ className = '' }: GoogleSignInButtonProps) {
  const handleClick = () => {
    signIn('google')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.64 9.2045c0-.638-.0573-1.251-.1636-1.836H9v3.472h4.843c-.2091 1.125-.8428 2.078-1.7955 2.716v2.258h2.908C16.901 14.33 17.64 11.983 17.64 9.2045z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-0.806 5.956-2.185l-2.908-2.258c-.806.54-1.84.859-3.048.859-2.345 0-4.329-1.584-5.036-3.71H0.957v2.331C2.438 15.982 5.481 18 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.706c-.18-.54-.282-1.116-.282-1.706s.103-1.166.282-1.706V4.963H0.957C0.351 6.183 0 7.554 0 9s.351 2.817.957 4.037l3.007-2.331z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.579c1.32 0 2.503.454 3.432 1.343l2.574-2.574C13.462.891 11.425 0 9 0 5.481 0 2.438 2.018 0.957 4.963l3.007 2.331C4.671 5.163 6.655 3.579 9 3.579z"
            fill="#EA4335"
          />
        </svg>
      </span>
      <span className="whitespace-nowrap">Sign in with Google</span>
    </button>
  )
}
