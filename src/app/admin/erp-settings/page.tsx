'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Boxes, Plus, Edit, Trash2, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ErpSettingsPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const { data: systems = [], isLoading } = useQuery({
    queryKey: ['erp-systems-all'],
    queryFn: () => fetch('/api/erp/systems').then(r => r.json()),
  })

  const testConnection = async (id: string) => {
    setTestingId(id)
    try {
      const res = await fetch(`/api/erp/erp-systems/${id}/test-connection`, { credentials: 'same-origin' })
      const data = await res.json()
      if (data.success) {
        toast.success('Connection successful!')
      } else {
        toast.error(data.error || 'Connection failed')
      }
    } catch {
      toast.error('Connection test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow
      ? `/api/erp/systems/${editingRow.id}`
      : '/api/erp/systems'
    const method = editingRow ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to save')
    }
    queryClient.invalidateQueries({ queryKey: ['erp-systems-all'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    const res = await fetch(`/api/erp/systems/${deleteRow.id}`, { method: 'DELETE', credentials: 'same-origin' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Failed to delete')
    } else {
      toast.success('ERP system removed')
    }
    queryClient.invalidateQueries({ queryKey: ['erp-systems-all'] })
    setDeleteRow(null)
  }

  const formFields: FormField[] = [
    { name: 'name', label: 'ERP Name', type: 'text', required: true, placeholder: 'DistriFlow' },
    { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'Distribution' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Distribution management system' },
    { name: 'dbHost', label: 'Database Host', type: 'text', required: true, placeholder: 'ep-cool-name-123456.us-east-2.aws.neon.tech' },
    { name: 'dbPort', label: 'Database Port', type: 'number', required: true, defaultValue: 5432 },
    { name: 'dbName', label: 'Database Name', type: 'text', required: true },
    { name: 'dbUser', label: 'Database User', type: 'text', required: true },
    { name: 'dbPassword', label: 'Database Password', type: 'password', required: true },
    {
      name: 'sslMode', label: 'SSL Mode', type: 'select',
      options: [{ label: 'require', value: 'require' }, { label: 'prefer', value: 'prefer' }, { label: 'disable', value: 'disable' }],
      defaultValue: 'require',
    },
    { name: 'color', label: 'Theme Color', type: 'text', placeholder: '#10b981' },
    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }], defaultValue: 'active' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="ERP Systems" description="Manage connected ERP databases" icon={Boxes}>
        <Button onClick={() => { setEditingRow(null); setFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-1" /> Add ERP
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>
          ))}
        </div>
      ) : systems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No ERP Systems</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first ERP system to get started</p>
            <Button onClick={() => { setEditingRow(null); setFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" /> Add ERP System
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((system: any) => (
            <Card key={system.id} className="relative overflow-hidden">
              {system.color && (
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: system.color }} />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2" style={{ backgroundColor: system.color ? `${system.color}15` : '#f1f5f9' }}>
                      <Boxes className="h-5 w-5" style={{ color: system.color || '#64748b' }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{system.name}</CardTitle>
                      <CardDescription>{system.industry}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={system.status === 'active' ? 'default' : 'secondary'}>
                    {system.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {system.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{system.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(system.id)}
                    disabled={testingId === system.id}
                  >
                    {testingId === system.id ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Wifi className="h-3.5 w-3.5 mr-1" />
                    )}
                    Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingRow(system); setFormOpen(true) }}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteRow(system)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingRow ? 'Edit ERP System' : 'Add New ERP System'}
        description={editingRow ? 'Update ERP system configuration' : 'Connect a new ERP database'}
        fields={formFields}
        onSubmit={handleSave}
        initialValues={editingRow}
        submitLabel={editingRow ? 'Update' : 'Connect'}
      />

      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={() => setDeleteRow(null)}
        title="Remove ERP System"
        description={`Remove "${deleteRow?.name}"? This will disconnect the database. Data in the ERP database will NOT be deleted.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
      />
    </div>
  )
}