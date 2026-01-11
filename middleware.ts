import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const { pathname } = request.nextUrl;

    // 1. Excepciones: archivos estáticos y la propia página de mantenimiento
    if (
        pathname.includes('.') || // Cualquier archivo con extensión (imagenes, favicon, etc)
        pathname.startsWith('/_next') || // Archivos internos de Next.js
        pathname === '/mantenimiento' // La página de destino
    ) {
        return NextResponse.next();
    }

    // 2. Bypass para administradores via cookie o URL
    // Si entras con ?hp_bypass=admin_secret se activa la cookie
    const hasBypassCookie = request.cookies.get('hp_maintenance_bypass')?.value === 'true';
    const hasBypassParam = request.nextUrl.searchParams.get('hp_bypass') === 'admin_secret';

    if (hasBypassParam) {
        const response = NextResponse.redirect(new URL(pathname, request.url));
        response.cookies.set('hp_maintenance_bypass', 'true', { maxAge: 60 * 60 * 24 }); // 24h
        return response;
    }

    // 3. Ejecutar Redirección si el modo está activo y no hay bypass
    if (isMaintenanceMode && !hasBypassCookie) {
        return NextResponse.redirect(new URL('/mantenimiento', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
