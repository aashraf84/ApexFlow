import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// ─── Default settings that are seeded on first load ──────────────────────────
const DEFAULT_SETTINGS: { key: string; value: string; category: string; description?: string }[] = [
  // ═══ Branding & Appearance ═══
  { key: 'site_logo_url', value: '/logo-full-dark.png', category: 'branding', description: 'Light mode logo URL' },
  { key: 'site_logo_dark_url', value: '/logo-full-dark.png', category: 'branding', description: 'Dark mode logo URL' },
  { key: 'site_logo_icon_url', value: '/logo-icon-dark.png', category: 'branding', description: 'Light mode icon logo URL' },
  { key: 'site_logo_icon_dark_url', value: '/logo-icon-dark.png', category: 'branding', description: 'Dark mode icon logo URL' },
  { key: 'site_logo_height', value: '36', category: 'branding', description: 'Logo height in pixels' },
  { key: 'site_logo_placement', value: 'left', category: 'branding', description: 'Logo placement: left, center' },
  { key: 'site_name', value: 'ApexFlow', category: 'branding', description: 'Site / brand name' },
  { key: 'site_tagline', value: 'One Engine. Every Industry. Unstoppable Scale.', category: 'branding', description: 'Site tagline' },
  { key: 'site_primary_color', value: 'cyan', category: 'branding', description: 'Primary brand color name' },
  { key: 'site_favicon_url', value: '/favicon-32.png', category: 'branding', description: 'Favicon URL' },

  // ═══ Content & SEO ═══
  { key: 'site_description', value: 'AI Powered Operating Systems that run entire industries.', category: 'seo', description: 'Site meta description' },
  { key: 'seo_keywords', value: 'ERP, business software, industry management, ApexFlow', category: 'seo', description: 'SEO keywords (comma separated)' },
  { key: 'seo_og_image_url', value: '', category: 'seo', description: 'Open Graph image URL for social sharing' },
  { key: 'seo_og_title', value: '', category: 'seo', description: 'Custom OG title (leave empty for site name)' },
  { key: 'seo_og_description', value: '', category: 'seo', description: 'Custom OG description (leave empty for site description)' },
  { key: 'seo_twitter_handle', value: '', category: 'seo', description: 'Twitter @handle for Twitter Cards' },
  { key: 'seo_robots_txt', value: 'index, follow', category: 'seo', description: 'Robots meta directive' },
  { key: 'seo_canonical_url', value: '', category: 'seo', description: 'Canonical URL (leave empty for auto)' },
  { key: 'seo_google_site_verification', value: '', category: 'seo', description: 'Google Search Console verification code' },

  // ═══ Header ═══
  { key: 'header_bg_color', value: '', category: 'header', description: 'Custom header background color (CSS)' },
  { key: 'header_show_search', value: 'true', category: 'header', description: 'Show search in header' },
  { key: 'header_show_theme_toggle', value: 'true', category: 'header', description: 'Show dark/light toggle' },
  { key: 'header_sticky', value: 'true', category: 'header', description: 'Make header sticky' },
  { key: 'header_cta_text', value: 'Get Started', category: 'header', description: 'Header CTA button text' },
  { key: 'header_cta_link', value: '/pricing', category: 'header', description: 'Header CTA button link' },
  { key: 'header_show_cta', value: 'true', category: 'header', description: 'Show CTA button in header' },

  // ═══ Footer ═══
  { key: 'footer_company_description', value: 'AI Powered Operating Systems that run entire industries. Built for scale, designed for simplicity.', category: 'footer', description: 'Company description in footer' },
  { key: 'footer_email', value: 'info@apexflow.cloud', category: 'footer', description: 'Contact email in footer' },
  { key: 'footer_phone', value: '+92 307 4903277', category: 'footer', description: 'Contact phone in footer' },
  { key: 'footer_address', value: 'Lahore, Pakistan', category: 'footer', description: 'Address in footer' },
  { key: 'footer_show_newsletter', value: 'true', category: 'footer', description: 'Show newsletter section' },
  { key: 'footer_copyright_text', value: '', category: 'footer', description: 'Custom copyright text (leave empty for auto)' },
  { key: 'footer_tagline', value: 'Built for industries that demand more.', category: 'footer', description: 'Footer tagline' },

  // ═══ Social Media ═══
  { key: 'social_facebook_url', value: '', category: 'social', description: 'Facebook page URL' },
  { key: 'social_twitter_url', value: '', category: 'social', description: 'Twitter/X profile URL' },
  { key: 'social_linkedin_url', value: '', category: 'social', description: 'LinkedIn company URL' },
  { key: 'social_instagram_url', value: '', category: 'social', description: 'Instagram profile URL' },
  { key: 'social_youtube_url', value: '', category: 'social', description: 'YouTube channel URL' },
  { key: 'social_tiktok_url', value: '', category: 'social', description: 'TikTok profile URL' },
  { key: 'social_whatsapp_number', value: '', category: 'social', description: 'WhatsApp business number' },
  { key: 'social_github_url', value: 'https://github.com/apexflowerp', category: 'social', description: 'GitHub organization URL' },
  { key: 'social_discord_url', value: '', category: 'social', description: 'Discord server invite URL' },
  { key: 'social_telegram_url', value: '', category: 'social', description: 'Telegram channel URL' },

  // ═══ Integrations — Analytics ═══
  { key: 'analytics_google_id', value: '', category: 'analytics', description: 'Google Analytics measurement ID (G-XXXXXXX)' },
  { key: 'analytics_facebook_pixel', value: '', category: 'analytics', description: 'Facebook Pixel ID' },
  { key: 'analytics_hotjar_id', value: '', category: 'analytics', description: 'Hotjar site ID' },
  { key: 'analytics_mixpanel_token', value: '', category: 'analytics', description: 'Mixpanel project token' },
  { key: 'analytics_plausible_domain', value: '', category: 'analytics', description: 'Plausible analytics domain' },
  { key: 'analytics_enabled', value: 'true', category: 'analytics', description: 'Enable analytics tracking' },

  // ═══ Integrations — Email ═══
  { key: 'email_provider', value: 'smtp', category: 'email', description: 'Email provider: smtp, sendgrid, mailgun, ses' },
  { key: 'email_smtp_host', value: '', category: 'email', description: 'SMTP server host' },
  { key: 'email_smtp_port', value: '587', category: 'email', description: 'SMTP server port' },
  { key: 'email_smtp_user', value: '', category: 'email', description: 'SMTP username' },
  { key: 'email_smtp_pass', value: '', category: 'email', description: 'SMTP password' },
  { key: 'email_from_name', value: 'ApexFlow', category: 'email', description: 'From name for outgoing emails' },
  { key: 'email_from_address', value: 'noreply@apexflow.cloud', category: 'email', description: 'From address for outgoing emails' },
  { key: 'email_sendgrid_key', value: '', category: 'email', description: 'SendGrid API key' },
  { key: 'email_mailgun_domain', value: '', category: 'email', description: 'Mailgun domain' },
  { key: 'email_mailgun_key', value: '', category: 'email', description: 'Mailgun API key' },
  { key: 'email_ses_region', value: '', category: 'email', description: 'AWS SES region' },
  { key: 'email_ses_access_key', value: '', category: 'email', description: 'AWS SES access key ID' },
  { key: 'email_ses_secret_key', value: '', category: 'email', description: 'AWS SES secret access key' },

  // ═══ Integrations — SMS ═══
  { key: 'sms_provider', value: '', category: 'sms', description: 'SMS provider: twilio, vonage, none' },
  { key: 'sms_twilio_sid', value: '', category: 'sms', description: 'Twilio Account SID' },
  { key: 'sms_twilio_token', value: '', category: 'sms', description: 'Twilio Auth Token' },
  { key: 'sms_twilio_from', value: '', category: 'sms', description: 'Twilio from number' },
  { key: 'sms_vonage_key', value: '', category: 'sms', description: 'Vonage API key' },
  { key: 'sms_vonage_secret', value: '', category: 'sms', description: 'Vonage API secret' },
  { key: 'sms_vonage_from', value: '', category: 'sms', description: 'Vonage from name/number' },

  // ═══ Integrations — Cloud Storage ═══
  { key: 'storage_provider', value: 'local', category: 'storage', description: 'Storage provider: local, s3, gcs, r2' },
  { key: 'storage_s3_bucket', value: '', category: 'storage', description: 'AWS S3 bucket name' },
  { key: 'storage_s3_region', value: '', category: 'storage', description: 'AWS S3 region' },
  { key: 'storage_s3_access_key', value: '', category: 'storage', description: 'AWS S3 access key ID' },
  { key: 'storage_s3_secret_key', value: '', category: 'storage', description: 'AWS S3 secret access key' },
  { key: 'storage_r2_account_id', value: '', category: 'storage', description: 'Cloudflare R2 account ID' },
  { key: 'storage_r2_access_key', value: '', category: 'storage', description: 'Cloudflare R2 access key' },
  { key: 'storage_r2_secret_key', value: '', category: 'storage', description: 'Cloudflare R2 secret key' },
  { key: 'storage_r2_bucket', value: '', category: 'storage', description: 'Cloudflare R2 bucket name' },

  // ═══ Integrations — Authentication ═══
  { key: 'auth_google_client_id', value: '', category: 'auth', description: 'Google OAuth client ID' },
  { key: 'auth_google_client_secret', value: '', category: 'auth', description: 'Google OAuth client secret' },
  { key: 'auth_github_client_id', value: '', category: 'auth', description: 'GitHub OAuth client ID' },
  { key: 'auth_github_client_secret', value: '', category: 'auth', description: 'GitHub OAuth client secret' },
  { key: 'auth_microsoft_client_id', value: '', category: 'auth', description: 'Microsoft SSO client ID' },
  { key: 'auth_microsoft_client_secret', value: '', category: 'auth', description: 'Microsoft SSO client secret' },
  { key: 'auth_sso_enabled', value: 'false', category: 'auth', description: 'Enable SSO for enterprise' },

  // ═══ Notifications ═══
  { key: 'notif_email_enabled', value: 'true', category: 'notifications', description: 'Enable email notifications' },
  { key: 'notif_sms_enabled', value: 'false', category: 'notifications', description: 'Enable SMS notifications' },
  { key: 'notif_push_enabled', value: 'false', category: 'notifications', description: 'Enable push notifications' },
  { key: 'notif_webhook_enabled', value: 'false', category: 'notifications', description: 'Enable webhook notifications' },
  { key: 'notif_webhook_url', value: '', category: 'notifications', description: 'Webhook endpoint URL' },
  { key: 'notif_webhook_secret', value: '', category: 'notifications', description: 'Webhook signing secret' },
  { key: 'notif_order_created', value: 'true', category: 'notifications', description: 'Notify on new order' },
  { key: 'notif_payment_received', value: 'true', category: 'notifications', description: 'Notify on payment received' },
  { key: 'notif_client_registered', value: 'true', category: 'notifications', description: 'Notify on new client' },
  { key: 'notif_support_ticket', value: 'true', category: 'notifications', description: 'Notify on support ticket' },
  { key: 'notif_system_alerts', value: 'true', category: 'notifications', description: 'Notify on system alerts' },

  // ═══ Security ═══
  { key: 'security_2fa_enabled', value: 'false', category: 'security', description: 'Enforce two-factor authentication for admins' },
  { key: 'security_session_timeout', value: '30', category: 'security', description: 'Session timeout in minutes' },
  { key: 'security_max_login_attempts', value: '5', category: 'security', description: 'Max login attempts before lockout' },
  { key: 'security_ip_whitelist', value: '', category: 'security', description: 'Allowed IPs (comma separated, leave empty for all)' },
  { key: 'security_cors_origins', value: '*', category: 'security', description: 'Allowed CORS origins (comma separated)' },
  { key: 'security_rate_limit_per_min', value: '100', category: 'security', description: 'API rate limit per minute per IP' },
  { key: 'security_data_retention_days', value: '365', category: 'security', description: 'Data retention period in days' },
  { key: 'security_gdpr_compliant', value: 'true', category: 'security', description: 'Enable GDPR compliance features' },
  { key: 'security_cookie_consent', value: 'true', category: 'security', description: 'Show cookie consent banner' },
  { key: 'security_ssl_enforced', value: 'true', category: 'security', description: 'Enforce HTTPS/SSL' },

  // ═══ Contact Information ═══
  { key: 'contact_email', value: 'info@apexflow.cloud', category: 'contact', description: 'General contact email' },
  { key: 'contact_phone', value: '+92 307 4903277', category: 'contact', description: 'General contact phone number' },
  { key: 'contact_address', value: 'Lahore, Pakistan', category: 'contact', description: 'Business address' },
  { key: 'contact_support_email', value: 'support@apexflow.cloud', category: 'contact', description: 'Support email address' },
  { key: 'contact_sales_email', value: 'sales@apexflow.cloud', category: 'contact', description: 'Sales email address' },
  { key: 'contact_business_hours', value: 'Mon-Fri 9:00 AM - 6:00 PM PKT', category: 'contact', description: 'Business hours display text' },
  { key: 'contact_latitude', value: '', category: 'contact', description: 'Map latitude for contact page' },
  { key: 'contact_longitude', value: '', category: 'contact', description: 'Map longitude for contact page' },

  // ═══ Feature Toggles ═══
  { key: 'feature_user_registration', value: 'true', category: 'features', description: 'Enable user registration' },
  { key: 'feature_demo_requests', value: 'true', category: 'features', description: 'Enable demo request form' },
  { key: 'feature_blog', value: 'true', category: 'features', description: 'Enable blog section' },
  { key: 'feature_contact_form', value: 'true', category: 'features', description: 'Enable contact form' },
  { key: 'feature_pricing_page', value: 'true', category: 'features', description: 'Show pricing page' },
  { key: 'feature_careers_page', value: 'true', category: 'features', description: 'Show careers page' },
  { key: 'feature_api_docs', value: 'false', category: 'features', description: 'Show API documentation' },
  { key: 'feature_changelog', value: 'true', category: 'features', description: 'Show changelog page' },
  { key: 'feature_status_page', value: 'false', category: 'features', description: 'Show status page link' },
  { key: 'feature_live_chat', value: 'false', category: 'features', description: 'Enable live chat widget' },
  { key: 'feature_dark_mode', value: 'true', category: 'features', description: 'Allow dark mode toggle' },
  { key: 'feature_multi_language', value: 'false', category: 'features', description: 'Enable multi-language support' },
  { key: 'feature_analytics_dashboard', value: 'true', category: 'features', description: 'Show analytics dashboard to admin' },
  { key: 'feature_referral_system', value: 'false', category: 'features', description: 'Enable referral system' },

  // ═══ Payment Configuration ═══
  { key: 'payment_currency', value: 'USD', category: 'payment', description: 'Default currency code' },
  { key: 'payment_currency_symbol', value: '$', category: 'payment', description: 'Currency display symbol' },
  { key: 'payment_stripe_publishable_key', value: '', category: 'payment', description: 'Stripe publishable key (pk_...)' },
  { key: 'payment_stripe_secret_key', value: '', category: 'payment', description: 'Stripe secret key (sk_...)' },
  { key: 'payment_stripe_webhook_secret', value: '', category: 'payment', description: 'Stripe webhook signing secret (whsec_...)' },
  { key: 'payment_tax_enabled', value: 'false', category: 'payment', description: 'Enable tax calculation' },
  { key: 'payment_tax_rate', value: '0', category: 'payment', description: 'Tax rate percentage' },
  { key: 'payment_tax_label', value: 'Tax', category: 'payment', description: 'Tax display label' },
  { key: 'payment_paypal_client_id', value: '', category: 'payment', description: 'PayPal client ID' },
  { key: 'payment_paypal_secret', value: '', category: 'payment', description: 'PayPal secret' },
  { key: 'payment_bank_transfer_enabled', value: 'false', category: 'payment', description: 'Enable bank transfer payments' },
  { key: 'payment_bank_details', value: '', category: 'payment', description: 'Bank transfer instructions / account details' },

  // ═══ Advanced ═══
  { key: 'maintenance_mode', value: 'false', category: 'advanced', description: 'Enable maintenance mode' },
  { key: 'maintenance_message', value: 'We are performing scheduled maintenance. Please check back soon.', category: 'advanced', description: 'Maintenance mode message' },
  { key: 'custom_css', value: '', category: 'advanced', description: 'Custom CSS overrides' },
  { key: 'custom_header_scripts', value: '', category: 'advanced', description: 'Custom scripts in <head>' },
  { key: 'custom_body_scripts', value: '', category: 'advanced', description: 'Custom scripts before </body>' },
  { key: 'api_rate_limit', value: '100', category: 'advanced', description: 'Global API rate limit per minute' },
  { key: 'backup_enabled', value: 'false', category: 'advanced', description: 'Enable automatic database backups' },
  { key: 'backup_frequency', value: 'daily', category: 'advanced', description: 'Backup frequency: daily, weekly' },
  { key: 'log_level', value: 'info', category: 'advanced', description: 'Logging level: debug, info, warn, error' },
]

async function ensureDefaults() {
  const existing = await withRetry((db) => db.siteSetting.findMany({ select: { key: true } }))
  const existingKeys = new Set(existing.map((s) => s.key))

  const toCreate = DEFAULT_SETTINGS.filter((s) => !existingKeys.has(s.key))
  if (toCreate.length > 0) {
    await withRetry((db) =>
      db.siteSetting.createMany({ data: toCreate })
    )
  }
}

// ─── GET: Fetch all site settings ────────────────────────────────────────────
export async function GET() {
  try {
    await ensureDefaults()

    const settings = await withRetry((db) =>
      db.siteSetting.findMany({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      })
    )

    // Group by category
    const grouped: Record<string, Record<string, { value: string; description?: string }>> = {}
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = {}
      grouped[s.category][s.key] = { value: s.value, description: s.description || undefined }
    }

    return NextResponse.json({ settings: grouped })
  } catch (error) {
    console.error('[SITE_SETTINGS] Failed to fetch:', error)
    // Return defaults when database is unavailable
    const grouped: Record<string, Record<string, { value: string; description?: string }>> = {}
    for (const s of DEFAULT_SETTINGS) {
      if (!grouped[s.category]) grouped[s.category] = {}
      grouped[s.category][s.key] = { value: s.value, description: s.description || undefined }
    }
    return NextResponse.json({ settings: grouped, dbWarning: 'Database unavailable — showing defaults' })
  }
}

// ─── PATCH: Update one or more settings ──────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body as { updates: { key: string; value: string }[] }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const results = []
    for (const update of updates) {
      const setting = await withRetry((db) =>
        db.siteSetting.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: { key: update.key, value: update.value, category: 'custom' },
        })
      )
      results.push(setting)
    }

    return NextResponse.json({ updated: results.length })
  } catch (error) {
    console.error('[SITE_SETTINGS] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 })
  }
}

// ─── POST: Upload logo image ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const settingKey = formData.get('key') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!settingKey) {
      return NextResponse.json({ error: 'No setting key provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, SVG, WebP, GIF' }, { status: 400 })
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 })
    }

    // Generate filename
    const ext = file.name.split('.').pop() || 'png'
    const safeKey = settingKey.replace(/[^a-z0-9_-]/gi, '_')
    const filename = `${safeKey}_${Date.now()}.${ext}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update the setting
    const imageUrl = `/uploads/${filename}`
    await withRetry((db) =>
      db.siteSetting.upsert({
        where: { key: settingKey },
        update: { value: imageUrl },
        create: { key: settingKey, value: imageUrl, category: 'logo' },
      })
    )

    return NextResponse.json({ url: imageUrl, key: settingKey })
  } catch (error) {
    console.error('[SITE_SETTINGS] Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// ─── DELETE: Reset a setting to default ──────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Find the default value
    const defaultSetting = DEFAULT_SETTINGS.find((s) => s.key === key)
    if (defaultSetting) {
      await withRetry((db) =>
        db.siteSetting.update({
          where: { key },
          data: { value: defaultSetting.value },
        })
      )
    } else {
      // Custom setting — just delete it
      await withRetry((db) =>
        db.siteSetting.delete({ where: { key } }).catch(() => {})
      )
    }

    return NextResponse.json({ reset: key })
  } catch (error) {
    console.error('[SITE_SETTINGS] Reset failed:', error)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
