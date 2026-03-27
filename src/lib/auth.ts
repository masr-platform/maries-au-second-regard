import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 jours
  pages: {
    signIn: '/connexion',
    error:  '/connexion',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',        type: 'email'    },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: {
            id:                    true,
            email:                 true,
            passwordHash:          true,
            prenom:                true,
            genre:                 true,
            role:                  true,
            plan:                  true,
            isVerified:            true,
            isBanned:              true,
            isSuspended:           true,
            questionnaireCompleted: true,
            photoUrl:              true,
          },
        })

        if (!user) return null
        if (user.isBanned || user.isSuspended) return null

        const valid = await compare(credentials.password, user.passwordHash)
        if (!valid) return null

        // Mise à jour last active
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        })

        return {
          id:                    user.id,
          email:                 user.email,
          name:                  user.prenom,
          role:                  user.role,
          plan:                  user.plan,
          isVerified:            user.isVerified,
          questionnaireCompleted: user.questionnaireCompleted,
          photoUrl:              user.photoUrl,
          genre:                 user.genre,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id                    = user.id
        token.role                  = (user as any).role
        token.plan                  = (user as any).plan
        token.isVerified            = (user as any).isVerified
        token.questionnaireCompleted = (user as any).questionnaireCompleted
        token.genre                 = (user as any).genre
      }
      // Rafraîchit questionnaireCompleted depuis la DB après update() client
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { questionnaireCompleted: true, plan: true, isVerified: true },
        })
        if (fresh) {
          token.questionnaireCompleted = fresh.questionnaireCompleted
          token.plan                  = fresh.plan
          token.isVerified            = fresh.isVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id                    = token.id as string
        session.user.role                  = token.role as string
        session.user.plan                  = token.plan as string
        session.user.isVerified            = token.isVerified as boolean
        session.user.questionnaireCompleted = token.questionnaireCompleted as boolean
        session.user.genre                 = token.genre as string
      }
      return session
    },
  },
}

// Types étendus NextAuth
declare module 'next-auth' {
  interface User {
    id: string
    role: string
    plan: string
    isVerified: boolean
    questionnaireCompleted: boolean
    genre: string
    photoUrl?: string | null
  }
  interface Session {
    user: User & {
      id: string
      role: string
      plan: string
      isVerified: boolean
      questionnaireCompleted: boolean
      genre: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    plan: string
    isVerified: boolean
    questionnaireCompleted: boolean
    genre: string
  }
}
