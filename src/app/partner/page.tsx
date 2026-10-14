import { redirect } from 'next/navigation'

// /partner is a duplicate of /become-partner — redirect to the canonical route
// (both previously rendered the same PartnerPage component).
export default function PartnerRoute() {
  redirect('/become-partner')
}
