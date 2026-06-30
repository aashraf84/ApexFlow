import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const client = await getDb().client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const contacts = await getDb().clientContact.findMany({
      where: { clientId: id },
      orderBy: { isPrimary: 'desc' },
    })

    return NextResponse.json({ data: contacts })
  } catch (error) {
    console.error('[Client Contacts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const client = await getDb().client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // If this is set as primary, unset other primaries
    if (body.isPrimary) {
      await getDb().clientContact.updateMany({
        where: { clientId: id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const contact = await getDb().clientContact.create({
      data: {
        clientId: id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || null,
        isPrimary: body.isPrimary || false,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ data: contact, message: 'Contact added successfully' }, { status: 201 })
  } catch (error) {
    console.error('[Client Contacts] POST error:', error)
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const contact = await getDb().clientContact.findFirst({
      where: { id: contactId, clientId: id },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    await getDb().clientContact.delete({ where: { id: contactId } })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('[Client Contacts] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
