import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, errorResponse } from '@/lib/api-helpers';

// GET: List all ERP systems (password masked)
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const systems = await db.erpSystem.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const masked = systems.map((s) => ({
      ...s,
      dbPassword: '••••••',
    }));

    return Response.json(masked);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new ERP system
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();

    const {
      name,
      industry,
      description,
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      sslMode,
      color,
      sortOrder,
    } = body;

    if (!name || !industry || !dbHost || !dbName || !dbUser || !dbPassword) {
      return Response.json(
        { error: 'name, industry, dbHost, dbName, dbUser, dbPassword are required' },
        { status: 400 }
      );
    }

    const system = await db.erpSystem.create({
      data: {
        name,
        industry,
        description: description || null,
        dbHost,
        dbPort: dbPort || 5432,
        dbName,
        dbUser,
        dbPassword,
        sslMode: sslMode || 'require',
        color: color || '#6366f1',
        sortOrder: sortOrder || 0,
      },
    });

    return Response.json({ system: { ...system, dbPassword: '••••••' } }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update an ERP system
export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();

    const { id, name, industry, description, status, color, sortOrder, dbHost, dbPort, dbName, dbUser, dbPassword, sslMode } = body;

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.erpSystem.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'ERP system not found' }, { status: 404 });
    }

    // If dbPassword is the masked value, don't update it
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (color !== undefined) updateData.color = color;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (dbHost !== undefined) updateData.dbHost = dbHost;
    if (dbPort !== undefined) updateData.dbPort = dbPort;
    if (dbName !== undefined) updateData.dbName = dbName;
    if (dbUser !== undefined) updateData.dbUser = dbUser;
    if (dbPassword !== undefined && dbPassword !== '••••••') updateData.dbPassword = dbPassword;
    if (sslMode !== undefined) updateData.sslMode = sslMode;

    const updated = await db.erpSystem.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ system: { ...updated, dbPassword: '••••••' } });
  } catch (error) {
    return errorResponse(error);
  }
}