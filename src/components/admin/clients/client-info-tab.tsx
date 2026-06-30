'use client'

import { MapPin, Phone, Mail, Globe, Building2, StickyNote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ClientInfoTabProps {
  client: {
    companyName: string; contactPerson: string; email: string
    phone: string | null; address: string | null; city: string | null
    state: string | null; country: string | null; postalCode: string | null
    website: string | null; taxId: string | null; industry: string | null
    businessType: string | null; companySize: string | null; notes: string | null
    erpSystem: { name: string } | null
    contacts: { id: string; name: string; email: string | null; phone: string | null; role: string | null; isPrimary: boolean }[]
  }
}

export function ClientInfoTab({ client }: ClientInfoTabProps) {
  const fields = [
    { icon: Building2, label: 'Company', value: client.companyName },
    { icon: Mail, label: 'Email', value: client.email },
    { icon: Phone, label: 'Phone', value: client.phone },
    { icon: MapPin, label: 'Address', value: [client.address, client.city, client.state, client.country].filter(Boolean).join(', ') || null },
    { icon: Globe, label: 'Website', value: client.website },
    { icon: Building2, label: 'Industry', value: client.industry },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3 border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {fields.map(f => f.value && (
            <div key={f.label} className="flex items-start gap-3">
              <f.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm text-foreground">{f.value}</p>
              </div>
            </div>
          ))}
          {client.erpSystem && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">ERP System</p>
                <p className="text-sm text-foreground">{client.erpSystem.name}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Contact Persons</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {client.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts added</p>
          ) : client.contacts.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  {c.isPrimary && <Badge className="text-[10px] px-1 py-0">Primary</Badge>}
                </div>
                {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
                {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {client.notes && (
        <Card className="lg:col-span-5 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="w-4 h-4" /> Notes
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p></CardContent>
        </Card>
      )}
    </div>
  )
}
