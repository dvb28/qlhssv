import { Response } from '@/common/types/response.type';
import { SessionType } from '@/common/types/session.type';
import { fetcher } from '@/common/utils/fetcher';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Auth Options
export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Record<'email' | 'password', string> | undefined,
      ): Promise<any> {
        // Check credentials
        if (!credentials) return null;

        // Response
        const login: Response = await fetcher({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: credentials?.email,
            password: credentials?.password,
          },
        });

        // Check Error
        if (!login?.ok) throw new Error('Login failed');

        // Return
        return login;
      },
    }),
  ],
  callbacks: {
    async session({ token: { data } }: any): Promise<SessionType | undefined> {
      // Return session info
      return data;
    },
    async jwt({ token, user }: any): Promise<any> {
      // If user is valid, return user
      if (user) return { ...token, ...user };

      //  Return
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

// Handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
