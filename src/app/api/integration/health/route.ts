import { NextResponse } from 'next/server'
import { getActiveErpSlugs, testErpConnection } from '@/lib/erp-connector'

export async function GET() {
  try {
    const activeSlugs = await getActiveErpSlugs()

    // Run health checks on all active ERP connections
    const healthChecks = await Promise.all(
      activeSlugs.map(async (slug) => {
        const result = await testErpConnection(slug)

        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
        if (!result.connected) {
          overallStatus = 'unhealthy'
        } else if (result.latency && result.latency > 2000) {
          overallStatus = 'degraded'
        }

        const erpNameMap: Record<string, string> = {
          apparelflow: 'ApparelFlow',
          hotelflow: 'HotelFlow',
          eduflow: 'EduFlow',
          martflow: 'MartFlow',
          pharmaflow: 'PharmaFlow',
          buildflow: 'BuildFlow',
          travelflow: 'TravelFlow',
          tenantflow: 'TenantFlow',
          factoryflow: 'FactoryFlow',
          foodflow: 'FoodFlow',
          autoflow: 'AutoFlow',
          healthflow: 'HealthFlow',
          textileflow: 'TextileFlow',
          creativeflow: 'CreativeFlow',
          distriflow: 'DistriFlow',
          logisticflow: 'LogisticFlow',
          fleetflow: 'FleetFlow',
          electroflow: 'ElectroFlow',
          bookflow: 'BookFlow',
        }

        return {
          slug,
          name: erpNameMap[slug] || slug,
          overallStatus,
          connected: result.connected,
          latency: result.latency || null,
          clientCount: result.clientCount || 0,
          error: result.error || null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        totalConnectors: healthChecks.length,
        healthy: healthChecks.filter((h) => h.overallStatus === 'healthy').length,
        degraded: healthChecks.filter((h) => h.overallStatus === 'degraded').length,
        unhealthy: healthChecks.filter((h) => h.overallStatus === 'unhealthy').length,
        connectors: healthChecks,
      },
    })
  } catch (error) {
    console.error('[INTEGRATION/HEALTH] Failed:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check integration health' },
      { status: 500 }
    )
  }
}
