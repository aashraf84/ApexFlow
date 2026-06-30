import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if the ERP sync WebSocket service is running (non-blocking)
    let wsServiceOnline = false
    try {
      await fetch('http://localhost:3031/socket.io/?EIO=4&transport=polling', {
        signal: AbortSignal.timeout(3000),
      })
      wsServiceOnline = true
    } catch { /* WS service not running, that's OK */ }

    // Do HTTP HEAD checks on each ERP website
    const ERP_WEBSITES: Record<string, { name: string; url: string }> = {
      apparelflow: { name: 'ApparelFlow', url: 'https://apparelflowerp.vercel.app' },
      hotelflow: { name: 'HotelFlow', url: 'https://hotelflowerp.vercel.app' },
      eduflow: { name: 'EduFlow', url: 'https://eduflowerp.vercel.app' },
      buildflow: { name: 'BuildFlow', url: 'https://buildflowerp.vercel.app' },
      pharmaflow: { name: 'PharmaFlow', url: 'https://pharmaflowerp.vercel.app' },
      travelflow: { name: 'TravelFlow', url: 'https://travelflowerp.vercel.app' },
      martflow: { name: 'MartFlow', url: 'https://martflowerp.vercel.app' },
      tenantflow: { name: 'TenantFlow', url: 'https://tenantflowerp.vercel.app' },
      factoryflow: { name: 'FactoryFlow', url: 'https://factoryflowerp.vercel.app' },
      foodflow: { name: 'FoodFlow', url: 'https://foodflowerp.vercel.app' },
      autoflow: { name: 'AutoFlow', url: 'https://autoflowerp.vercel.app' },
      healthflow: { name: 'HealthFlow', url: 'https://healthflowerp.vercel.app' },
      textileflow: { name: 'TextileFlow', url: 'https://textileflowerp.vercel.app' },
      creativeflow: { name: 'CreativeFlow', url: 'https://creativeflowerp.vercel.app' },
      distriflow: { name: 'DistriFlow', url: 'https://distriflowerp.vercel.app' },
      logisticflow: { name: 'LogisticFlow', url: 'https://logisticflowerp.vercel.app' },
      fleetflow: { name: 'FleetFlow', url: 'https://fleetflowerp.vercel.app' },
      electroflow: { name: 'ElectroFlow', url: 'https://electroflowerp.vercel.app' },
      bookflow: { name: 'BookFlow', url: 'https://bookflowerp.vercel.app' },
      fuelflow: { name: 'FuelFlow', url: 'https://fuelflowerp.vercel.app' },
    }

    const results = await Promise.allSettled(
      Object.entries(ERP_WEBSITES).map(async ([slug, info]) => {
        const start = Date.now()
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          const res = await fetch(info.url, { 
            method: 'HEAD', 
            signal: controller.signal,
            headers: { 'User-Agent': 'ApexFlow-HealthCheck/1.0' }
          })
          clearTimeout(timeout)
          return {
            slug,
            name: info.name,
            connected: res.ok,
            latency: Date.now() - start,
            status: res.status,
          }
        } catch (error) {
          return {
            slug,
            name: info.name,
            connected: false,
            latency: null,
            error: error instanceof Error ? error.message : 'Failed',
          }
        }
      })
    )

    const statuses = results.map(r => r.status === 'fulfilled' ? r.value : { slug: 'unknown', connected: false, error: 'Check failed' })
    
    const connected = statuses.filter(s => s.connected).length
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: statuses.length,
      connected,
      disconnected: statuses.length - connected,
      wsServiceOnline,
      statuses,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check live status' },
      { status: 500 }
    )
  }
}
