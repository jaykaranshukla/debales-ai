import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { LoginSchema } from '@/lib/zod/schemas';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();

        const user = await User.findOne({ email: parsed.data.email }).lean();
        if (!user) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          memberships: user.memberships.map((m) => ({
            projectId: m.projectId.toString(),
            role: m.role,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.memberships = user.memberships;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.memberships = token.memberships;
      return session;
    },
  },
};
