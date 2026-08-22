import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: "ADMIN" | "USER"
        } & DefaultSession["user"]
    }

    interface User {
        role: "ADMIN" | "USER"
    }
}
