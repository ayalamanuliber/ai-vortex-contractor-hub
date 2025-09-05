import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Get authorized emails from environment variable
const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '').split(',').map(email => email.trim())

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow specific email addresses
      if (user.email && authorizedEmails.includes(user.email)) {
        return true
      }
      
      console.log(`🚨 Unauthorized login attempt: ${user.email}`)
      return false // Deny access
    },
    async session({ session, token }) {
      // Add any custom session data here
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom login page
    error: '/auth/error', // Error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }