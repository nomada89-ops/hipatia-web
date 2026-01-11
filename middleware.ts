import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const { pathname } = request.nextUrl;

    // 1. Excepciones: archivos estáticos, mantenimiento y BLOG
    if (
        pathname.includes('.') || 
        pathname.startsWith('/_next') || 
        pathname === '/mantenimiento' || 
        pathname.startsWith('/blog') ||
        pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // 2. Bypass para administradores
    const hasBypassCookie = request.cookies.get('hp_maintenance_bypass')?.value === 'true';
    const hasBypassParam = request.nextUrl.searchParams.get('hp_bypass') === 'admin_secret';

    if (hasBypassParam) {
        const response = NextResponse.redirect(new URL(pathname === '/' ? '/' : pathname, request.url));
        response.cookies.set('hp_maintenance_bypass', 'true', { maxAge: 60 * 60 * 24, path: '/' });
        return response;
    }

    // 3. Redirección si mantenimiento activo y no es admin
    if (isMaintenanceMode && !hasBypassCookie) {
        return NextResponse.redirect(new URL('/mantenimiento', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
