import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const res = await axios.post(`${apiBaseUrl}/auth/refresh`, {
      refreshToken: token.refresh_token,
    });

    const newAccessToken =
      res.data?.access_token ?? res.data?.body?.access_token;
    const newRefreshToken =
      res.data?.refresh_token ?? res.data?.body?.refresh_token;

    if (!newAccessToken) {
      throw new Error("Refresh response missing access token");
    }

    console.log("Access token refreshed successfully");
    return {
      ...token,
      access_token: newAccessToken,
      refresh_token: newRefreshToken ?? token.refresh_token,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            },
          );

          const user = await res.json();

          if (res.ok && user) {
            return user;
          }

          const errorMessage =
            user?.message || user?.error || "Invalid email or password";
          throw new Error(errorMessage);
        } catch (error) {
          throw new Error(error.message || "An error occurred during sign in");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.body.id;
        token.f_name = user.body.f_name;
        token.m_name = user.body.m_name;
        token.l_name = user.body.l_name;
        token.full_name = user.body.full_name;
        token.email = user.body.email;
        token.role = user.body.role;
        token.division_id = user.body.division_id;
        token.division = user.body.division;
        token.division_abrv = user.body.division_abrv;
        token.profile_img = user.body.profile_img || null; // ✅ added
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

        return token;
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      if (Date.now() > token.refreshTokenExpires) {
        console.log("Refresh token expired, please log in again");
        return { ...token, error: "RefreshTokenExpired" };
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.f_name = token.f_name;
      session.user.m_name = token.m_name;
      session.user.l_name = token.l_name;
      session.user.full_name = token.full_name;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.division_id = token.division_id;
      session.user.division = token.division;
      session.user.division_abrv = token.division_abrv;
      session.user.profile_img = token.profile_img || null; // ✅ added
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.error = token.error;

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };