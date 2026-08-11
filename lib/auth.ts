import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    // Only register Google when credentials are configured, so the app
    // still boots (and degrades gracefully) without GOOGLE_CLIENT_ID /
    // GOOGLE_CLIENT_SECRET in .env.local.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/connect-wallet",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign-in, send users to the dashboard
      if (url.startsWith(baseUrl) && !url.includes("/api/auth")) {
        return `${baseUrl}/dashboard`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
}
