// import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { query } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google sign-in feature commented out
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in database when they sign in
      if (user.email && user.id) {
        try {
          await query(
            `INSERT INTO users (id, email, name, created_at, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (id) 
             DO UPDATE SET 
               email = EXCLUDED.email,
               name = EXCLUDED.name,
               updated_at = CURRENT_TIMESTAMP`,
            [user.id, user.email, user.name || '']
          )
        } catch (error) {
          console.error('Error creating/updating user in database:', error)
          // Don't block sign-in if database fails
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        
        // User ID is already available in session.user.id (from token.sub)
        // No need to attach dbId as it's the same as the user ID
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
