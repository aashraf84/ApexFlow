import { redirect } from 'next/navigation'

// /dashboard redirected to the canonical /admin/dashboard
// (legacy tab-based DashboardLayout retired — it was an unauthenticated
// public route with a broken logout; the route-based /admin/* shell is
// the single canonical admin UI, gated by src/middleware.ts)
export default function DashboardRoute() {
  redirect('/admin/dashboard')
}
