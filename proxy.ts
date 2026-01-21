import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  // Allow public access to test/verification endpoints
  publicRoutes: [
    '/api/test-db',
    '/api/verify-tables',
    '/api/debug-db',
  ],
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
