'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Heart, TrendingUp } from 'lucide-react'

function DonutSegment({ percent, color, offset }: { percent: number; color: string; offset: number }) {
  const circumference = 2 * Math.PI * 36
  const dashArray = `${(percent / 100) * circumference} ${circumference}`
  return <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="8" strokeDasharray={dashArray} strokeDashoffset={-offset} transform="rotate(-90 40 40)" />
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const offsets = segments.reduce<number[]>((acc, s, i) => {
    const pct = (s.value / total) * 100
    acc.push(i === 0 ? 0 : acc[i - 1] + (segments[i - 1].value / total) * 100)
    return acc
  }, [])
  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80">
        {segments.map((s, i) => (
          <DonutSegment key={i} percent={(s.value / total) * 100} color={s.color} offset={offsets[i]} />
        ))}
      </svg>
      <div className="space-y-1">{segments.map((s, i) => (
        <div key={i} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-xs">{s.label}: <strong>{s.value}%</strong></span></div>
      ))}</div>
    </div>
  )
}

export function AudienceInsights() {
  const [data, setData] = useState<{ age: { label: string; value: number; color: string }[]; gender: { label: string; value: number; color: string }[]; locations: string[]; interests: string[]; growthTrend: number[] } | null>(null)

  useEffect(() => {
    fetch('/api/marketing/analytics').then(r => r.json()).then(d => setData(d.audience || null)).catch(() => {})
  }, [])

  const audience = data || {
    age: [{ label: '18-24', value: 22, color: 'var(--gg-teal)' }, { label: '25-34', value: 38, color: 'var(--gg-rose)' }, { label: '35-44', value: 25, color: 'var(--gg-amber)' }, { label: '45+', value: 15, color: 'var(--gg-violet)' }],
    gender: [{ label: 'Male', value: 48, color: 'var(--gg-cyan)' }, { label: 'Female', value: 45, color: 'var(--gg-rose)' }, { label: 'Other', value: 7, color: 'var(--gg-violet)' }],
    locations: ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'],
    interests: ['Technology', 'Business', 'Marketing', 'SaaS', 'Entrepreneurship'],
    growthTrend: [120, 145, 138, 162, 155, 178, 190],
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold flex items-center gap-2"><Users className="w-4 h-4" />Audience Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60"><CardHeader className="pb-2"><CardTitle className="text-sm">Age Distribution</CardTitle></CardHeader><CardContent><DonutChart segments={audience.age} /></CardContent></Card>
        <Card className="border-border/60"><CardHeader className="pb-2"><CardTitle className="text-sm">Gender Split</CardTitle></CardHeader><CardContent><DonutChart segments={audience.gender} /></CardContent></Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><MapPin className="w-3 h-3" />Top Locations</CardTitle></CardHeader>
          <CardContent><div className="space-y-1.5">{audience.locations.map((l, i) => <div key={i} className="flex items-center gap-2"><span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span><span className="text-xs">{l}</span></div>)}</div></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Heart className="w-3 h-3" />Interests</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-1.5">{audience.interests.map(i => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted capitalize">{i}</span>)}</div></CardContent>
        </Card>
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><TrendingUp className="w-3 h-3" />Audience Growth (7 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-12">
            {audience.growthTrend.map((v, i) => {
              const max = Math.max(...audience.growthTrend)
              return <div key={i} className="flex-1 rounded-t bg-[var(--gg-teal)]" style={{ height: `${(v / max) * 100}%`, opacity: 0.5 + (i / audience.growthTrend.length) * 0.5, minHeight: '4px' }} />
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>7d ago</span><span>Today</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
