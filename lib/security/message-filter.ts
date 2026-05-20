// Patterns that indicate users trying to exchange contact info outside the platform
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi
const PHONE_REGEX =
  /(\+?90|0)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g
const PLATFORM_KEYWORDS =
  /\b(whatsapp|instagram|tiktok|telegram|twitter|facebook|snapchat)\b/gi

export interface FilterResult {
  flagged: boolean
  reason: string | null
  sanitized: string
}

export function filterMessageContent(body: string): FilterResult {
  if (EMAIL_REGEX.test(body)) {
    EMAIL_REGEX.lastIndex = 0
    return { flagged: true, reason: 'email_detected', sanitized: body }
  }
  EMAIL_REGEX.lastIndex = 0

  if (PHONE_REGEX.test(body)) {
    PHONE_REGEX.lastIndex = 0
    return { flagged: true, reason: 'phone_detected', sanitized: body }
  }
  PHONE_REGEX.lastIndex = 0

  if (PLATFORM_KEYWORDS.test(body)) {
    PLATFORM_KEYWORDS.lastIndex = 0
    return {
      flagged: true,
      reason: 'external_platform_mentioned',
      sanitized: body,
    }
  }
  PLATFORM_KEYWORDS.lastIndex = 0

  return { flagged: false, reason: null, sanitized: body }
}
