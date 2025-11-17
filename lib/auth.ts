import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { query } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
        
        // Try to load user profile from database
        try {
          const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [token.sub]
          )
          if (result.rows.length > 0) {
            const dbUser = result.rows[0]
            // Attach database user ID to session
            session.user.dbId = dbUser.id
          }
        } catch (error) {
          console.error('Error loading user from database:', error)
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
