'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'toggle' | 'date'
  placeholder?: string
  required?: boolean
  defaultValue?: string | number | boolean
  options?: { label: string; value: string }[]
  disabled?: boolean
}

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => Promise<void>
  initialValues?: Record<string, any>
  submitLabel?: string
  loading?: boolean
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  initialValues,
  submitLabel = 'Save',
  loading = false,
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [internalLoading, setInternalLoading] = useState(false)

  const currentValues = { ...initialValues, ...values }

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const requiredField = fields.find(f => f.required && !currentValues[f.name])
    if (requiredField) {
      toast.error(`${requiredField.label} is required`)
      return
    }
    setInternalLoading(true)
    try {
      await onSubmit(currentValues)
      setValues({})
      onOpenChange(false)
      toast.success('Saved successfully')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save')
    } finally {
      setInternalLoading(false)
    }
  }

  const isLoading = loading || internalLoading

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setValues({}); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map(field => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'select' && (
                <Select
                  value={String(currentValues[field.name] ?? '')}
                  onValueChange={(v) => handleChange(field.name, v)}
                  disabled={field.disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === 'toggle' && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={field.name}
                    checked={!!currentValues[field.name]}
                    onCheckedChange={(v) => handleChange(field.name, v)}
                    disabled={field.disabled}
                  />
                  <span className="text-sm text-muted-foreground">
                    {currentValues[field.name] ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  value={String(currentValues[field.name] ?? '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  rows={3}
                />
              )}
              {!['select', 'toggle', 'textarea'].includes(field.type) && (
                <Input
                  id={field.name}
                  type={field.type}
                  value={String(currentValues[field.name] ?? '')}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setValues({}); onOpenChange(false) }} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}