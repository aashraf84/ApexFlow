// ApexFlow Cloud — Bank Transfer Details
// GET /api/checkout/bank-details?currency=USD
// Returns bank account details for wire transfer based on currency
// Now fetches from admin-configured PaymentAccount records, falls back to hardcoded

import { NextRequest, NextResponse } from 'next/server'
import { getBankDetails, generatePaymentReference } from '@/lib/payment-gateways'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = (searchParams.get('currency') || 'PKR').toUpperCase()

    // Try to fetch from admin-configured accounts first
    let bankDetails: Record<string, string> | null = null
    try {
      const account = await db.paymentAccount.findFirst({
        where: {
          type: 'bank_account',
          currency: currency,
          isActive: true,
        },
        orderBy: [
          { isDefault: 'desc' },
          { sortOrder: 'asc' },
        ],
      })

      if (account) {
        bankDetails = {
          bankName: account.bankName || '',
          accountTitle: account.accountTitle || '',
          accountNumber: account.accountNumber || '',
          iban: account.iban || '',
          swiftCode: account.swiftCode || '',
          branch: account.branchName || '',
        }
        if (account.correspondentBank) {
          bankDetails.correspondentBank = account.correspondentBank
          bankDetails.correspondentSwift = account.correspondentSwift || ''
        }
      }
    } catch {
      // Database may not be available, fall back to hardcoded
    }

    // Fallback to hardcoded bank details
    if (!bankDetails) {
      bankDetails = getBankDetails(currency) as Record<string, string>
    }

    const reference = generatePaymentReference()

    return NextResponse.json({
      success: true,
      data: {
        bankDetails,
        paymentReference: reference,
        currency,
        instructions: [
          `Transfer the exact amount to the bank account above`,
          `Include reference ${reference} in the transfer description`,
          `Email proof of payment to billing@apexflow.io`,
          `Your subscription will be activated within 1-2 business days after verification`,
        ],
      },
    })
  } catch (error) {
    console.error('[Bank Details] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    )
  }
}
