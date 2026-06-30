import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // FleetFlow uses mock data for now — return static stats
    return NextResponse.json({
      connected: true,
      core: {
        vehicles: 43,
        activeDrivers: 28,
        activeTrips: 18,
        onTimeRate: 92.4,
      },
      fleet: {
        totalVehicles: 43,
        activeVehicles: 38,
        maintenanceDue: 5,
        totalKmThisMonth: 127500,
      },
      fuel: {
        totalCostThisMonth: 2850000,
        averageEfficiency: 8.2,
        fraudAlerts: 2,
      },
      trips: {
        completedThisMonth: 156,
        inProgress: 18,
        cancelled: 3,
        averageTripDuration: 8.5,
      },
      maintenance: {
        scheduledThisMonth: 12,
        completed: 9,
        overdue: 1,
        totalCostThisMonth: 450000,
      },
      deliveries: {
        totalThisMonth: 234,
        onTime: 216,
        delayed: 18,
        pending: 15,
      },
    })
  } catch (error) {
    console.error('[FLEETFLOW-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FleetFlow stats', connected: false },
      { status: 500 }
    )
  }
}
