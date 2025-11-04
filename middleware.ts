import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/',
];

// Rutas restringidas por rol
const ROLE_GUARDS: Array<{ prefix: string; role: string }> = [
  { prefix: '/dashboard/admin', role: 'admin' },
  { prefix: '/admin', role: 'admin' },
  { prefix: '/dashboard/student', role: 'student' },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;
  const userInfoCookie = req.cookies.get('user_info')?.value;

  let role: string | undefined;
  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(userInfoCookie);
      role = userInfo?.role;
    } catch (e) { /* Ignorar error de parseo */ }
  }

  const isAdmin = role === 'admin' || role === 'Administrador';
  const isStudent = role === 'student' || role === 'Estudiante';
  const isProfessor = role === 'professor' || role === 'Profesor';

  // Si el usuario ya está autenticado y está en login/registro, redirigir al dashboard por rol
  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register';
  if (token && isAuthPage) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = isAdmin ? '/dashboard/admin'
      : isStudent ? '/dashboard/student' // Añadir redirección para profesor
      : isProfessor ? '/dashboard/professor'
      : '/dashboard';
    return NextResponse.redirect(redirect);
  }

  // Si el usuario ya está autenticado y entra a la raíz '/', redirigir a su dashboard
  if (token && pathname === '/') {
    const redirect = req.nextUrl.clone();
    redirect.pathname = isAdmin ? '/dashboard/admin' // Añadir redirección para profesor
      : isStudent ? '/dashboard/student'
      : isProfessor ? '/dashboard/professor'
      : '/dashboard';
    return NextResponse.redirect(redirect);
  }

  // Permitir assets y rutas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  // Si no hay sesión y la ruta no es pública, redirigir al login
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validar guardas por rol
  const guard = ROLE_GUARDS.find((g) => pathname.startsWith(g.prefix));
  if (guard) {
    // Si el guard es para admin y el usuario no es admin, redirigir
    if (guard.role === 'admin' && !isAdmin) { // Si la ruta es de admin y el usuario NO es admin
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashUrl);
    }
    // Si la ruta es de estudiante y el usuario NO es estudiante
    if (guard.role === 'student' && !isStudent) {
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashUrl);
    }
    // Si la ruta es de profesor y el usuario NO es profesor
    if (guard.role === 'professor' && !isProfessor) {
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
