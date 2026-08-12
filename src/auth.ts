import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    jwt({ token, profile }) {
      // Pin the token's subject to Google's stable account id (profile.sub) on
      // sign-in. Without this, some deployments end up with a fresh random id
      // on every login instead of a consistent one per Google account.
      if (profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
