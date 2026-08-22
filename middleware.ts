import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const isOnAdminPanel = nextUrl.pathname.startsWith("/controlpanel")
    const isOnAdminLogin = nextUrl.pathname.startsWith("/admin-login")
    const isOnLoginPage = nextUrl.pathname.startsWith("/login")
    const isOnProfile = nextUrl.pathname.startsWith("/profile")
    const isOnOrders = nextUrl.pathname.startsWith("/orders")

    // 1. Admin Panel Protection
    if (isOnAdminPanel) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/admin-login", nextUrl))

        // @ts-ignore
        if (req.auth?.user?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        return NextResponse.next()
    }

    // 2. Admin Login Page
    if (isOnAdminLogin) {
        if (isLoggedIn) {
            // @ts-ignore
            if (req.auth?.user?.role === "ADMIN") {
                return NextResponse.redirect(new URL("/controlpanel", nextUrl))
            }
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        return NextResponse.next()
    }

    // 3. Normal Login Page
    if (isOnLoginPage) {
        if (isLoggedIn) {
            // @ts-ignore
            if (req.auth?.user?.role === "ADMIN") {
                return NextResponse.redirect(new URL("/controlpanel", nextUrl))
            }
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        return NextResponse.next()
    }

    // 4. Protected User Routes
    if (isOnProfile || isOnOrders) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl))
        return NextResponse.next()
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
