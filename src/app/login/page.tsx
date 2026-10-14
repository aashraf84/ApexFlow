import { redirect } from 'next/navigation'

// /login redirected to the canonical /admin/login (legacy duplicate route retired)
export default function LoginRoute() {
  redirect('/admin/login')
}
