import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'


// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/sign-up']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    const isProtectedRoute = protectedRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
    );

    const isPublicRoute = publicRoutes.includes(path)

    // 1. Get the jwt token from cookies
    const authToken = (await cookies()).get('token')?.value

    // 2. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !authToken) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (authToken && !isPublicRoute) {
        // 3. Fecth the users info from the backend
        try {
            const { payload } = await jose.jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
        } catch (e) {
            return NextResponse.redirect(new URL('/login', req.nextUrl))
        }
    }

    // Store current request url in a custom header, which you can read later
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-url', req.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}