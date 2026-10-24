export type Enquiry = {
  name: string
  contact: string
  journey: string
  locale: string
}

/**
 * Delivers an enquiry to the team's Telegram chat through the Bot API.
 * Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the server environment (Vercel and the VPS);
 * TELEGRAM_API_URL optionally points at another Bot API server (e.g. a local stub for tests).
 * Returns false when delivery is not configured or fails, so the form never reports a false success.
 */
export async function deliverEnquiry(enquiry: Enquiry): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('[seasmates] enquiry not delivered: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set')
    return false
  }

  const text = [
    'New seasmates enquiry',
    `Name: ${enquiry.name}`,
    `WhatsApp / Telegram: ${enquiry.contact}`,
    `Journey: ${enquiry.journey}`,
    `Language: ${enquiry.locale}`,
  ].join('\n')

  try {
    const apiUrl = process.env.TELEGRAM_API_URL || 'https://api.telegram.org'
    const response = await fetch(`${apiUrl}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(10_000),
    })
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null
    if (!response.ok || !result?.ok) {
      console.error('[seasmates] enquiry not delivered: Telegram API returned', response.status)
      return false
    }
    return true
  } catch (error) {
    console.error('[seasmates] enquiry not delivered:', error instanceof Error ? error.message : error)
    return false
  }
}
