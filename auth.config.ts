import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    session: { strategy: "jwt" },
    trustHost: true,
    providers: [],
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = parseInt(token.sub, 10).toString()
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        },
    },
} satisfies NextAuthConfig
