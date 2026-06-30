import { NextResponse } from 'next/server'

export async function GET() {
  // Analytics data — generated from campaign metrics
  const social = {
    facebook: { followers: 12400, engagement: 4.2, topPost: 'Product Launch', reach: 8500, weekData: [45, 52, 49, 63, 58, 72, 68] },
    instagram: { followers: 8300, engagement: 6.1, topPost: 'Behind the Scenes', reach: 6200, weekData: [32, 38, 35, 42, 40, 55, 48] },
    twitter: { followers: 5200, engagement: 3.8, topPost: 'Industry Insights', reach: 4100, weekData: [22, 28, 25, 35, 30, 38, 33] },
    linkedin: { followers: 15800, engagement: 5.5, topPost: 'Case Study', reach: 12000, weekData: [55, 62, 58, 75, 70, 88, 82] },
    tiktok: { followers: 3100, engagement: 8.3, topPost: 'Team Culture', reach: 2800, weekData: [15, 22, 18, 28, 25, 35, 30] },
  }

  const audience = {
    age: [
      { label: '18-24', value: 22, color: 'var(--gg-teal)' },
      { label: '25-34', value: 38, color: 'var(--gg-rose)' },
      { label: '35-44', value: 25, color: 'var(--gg-amber)' },
      { label: '45+', value: 15, color: 'var(--gg-violet)' },
    ],
    gender: [
      { label: 'Male', value: 48, color: 'var(--gg-cyan)' },
      { label: 'Female', value: 45, color: 'var(--gg-rose)' },
      { label: 'Other', value: 7, color: 'var(--gg-violet)' },
    ],
    locations: ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'],
    interests: ['Technology', 'Business', 'Marketing', 'SaaS', 'Entrepreneurship', 'AI & ML', 'Productivity'],
    growthTrend: [120, 145, 138, 162, 155, 178, 190],
  }

  return NextResponse.json({ social, audience })
}
