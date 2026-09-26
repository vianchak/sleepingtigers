import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: any) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(uk|en)/:path*']
};




