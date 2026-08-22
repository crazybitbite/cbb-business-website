import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import LinkedIn from "next-auth/providers/linkedin"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { compare } from "bcryptjs"

// Custom Adapter to handle Int IDs with NextAuth (which expects Strings)
// We cast to 'any' to avoid strict type checks on the mismatched ID types (Int vs String)
function CustomPrismaAdapter(p: typeof prisma): any {
    // Cast: Adapter interface marks all methods optional, but PrismaAdapter provides them
    const adapter = PrismaAdapter(p) as Required<ReturnType<typeof PrismaAdapter>>

    return {
        ...adapter,
        createUser: (data: any) => adapter.createUser(data),
        getUser: (id: string) => {
            const intId = parseInt(id, 10)
            return isNaN(intId) ? null : p.user.findUnique({ where: { id: intId } })
        },
        getUserByEmail: (email: string) => adapter.getUserByEmail(email),
        getUserByAccount: (provider_providerAccountId: any) => adapter.getUserByAccount(provider_providerAccountId),
        updateUser: (data: any) => {
            const { id, ...rest } = data
            const intId = parseInt(id, 10)
            return isNaN(intId) ? null : p.user.update({ where: { id: intId }, data: rest })
        },
        deleteUser: (id: string) => {
            const intId = parseInt(id, 10)
            return isNaN(intId) ? null : adapter.deleteUser(id) // Adapter expects string but might fail internally if it assumes Cuid
        },
        linkAccount: (data: any) => {
            data.userId = parseInt(data.userId, 10)
            return adapter.linkAccount(data)
        },
        getSessionAndUser: async (sessionToken: string) => {
            const result = await adapter.getSessionAndUser(sessionToken)
            if (!result) return null
            return {
                session: result.session,
                user: { ...result.user, id: result.user.id.toString() } // Convert Int to String for NextAuth
            }
        },
        createSession: (data: any) => {
            data.userId = parseInt(data.userId, 10)
            return adapter.createSession(data)
        },
        // Cast to any to avoid strict Adapter Interface mismatches for this workaround
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    adapter: CustomPrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    include_granted_scopes: "true"
                },
                allowDangerousEmailAccountLinking: true
            }
        }),
        Twitter({
            clientId: process.env.AUTH_TWITTER_ID,
            clientSecret: process.env.AUTH_TWITTER_SECRET,
            authorization: {
                params: {
                    scope: "tweet.read users.read follows.read offline.access"
                },
                allowDangerousEmailAccountLinking: true
            }
        }),
        LinkedIn({
            clientId: process.env.AUTH_LINKEDIN_ID,
            clientSecret: process.env.AUTH_LINKEDIN_SECRET,
            authorization: {
                params: {
                    scope: "openid profile email w_member_social"
                },
                allowDangerousEmailAccountLinking: true
            }
        }),
        Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
            authorization: {
                params: {
                    scope: "email public_profile pages_show_list instagram_basic"
                },
                allowDangerousEmailAccountLinking: true
            }
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user) return null

                    const passwordsMatch = await compare(password, user.password || "")
                    if (passwordsMatch) return { ...user, id: user.id.toString() }
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token }) {
            if (token.sub) {
                const uid = parseInt(token.sub, 10)
                if (!isNaN(uid)) {
                    const user = await prisma.user.findUnique({
                        where: { id: uid },
                        select: { role: true },
                    })
                    if (user) {
                        token.role = user.role
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        }
    },
})
