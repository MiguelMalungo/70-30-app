/**
 * Input sanitization & validation utilities.
 *
 * Protects against XSS, injection, and malformed input in forms and chat.
 */

// ── HTML entity map ──
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Sanitize a chat message:
 * - Trim whitespace
 * - Limit length
 * - Strip control characters
 * - Escape HTML entities
 */
export function sanitizeMessage(text, maxLength = 2000) {
  if (typeof text !== 'string') return '';
  return escapeHtml(
    text
      .trim()
      .slice(0, maxLength)
      // Remove control characters (except newline, tab)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  );
}

/**
 * Sanitize a plain text input (address, name, etc.):
 * - Trim
 * - Limit length
 * - Strip non-printable characters
 */
export function sanitizeText(text, maxLength = 500) {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validate an email address.
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate a Portuguese phone number (9 digits, starts with 9/2/3).
 */
export function isValidPhonePT(phone) {
  if (typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^(\+351)?[923]\d{8}$/.test(clean);
}

/**
 * Validate a Portuguese postal code (XXXX-XXX).
 */
export function isValidPostalCodePT(code) {
  if (typeof code !== 'string') return false;
  return /^\d{4}-\d{3}$/.test(code.trim());
}

/**
 * Rate limiter — returns true if action should be BLOCKED.
 *
 * Usage:
 *   const limiter = createRateLimiter(5, 10000); // 5 actions per 10s
 *   if (limiter()) return; // blocked
 */
export function createRateLimiter(maxActions, windowMs) {
  const timestamps = [];
  return () => {
    const now = Date.now();
    // Remove expired entries
    while (timestamps.length && timestamps[0] < now - windowMs) {
      timestamps.shift();
    }
    if (timestamps.length >= maxActions) {
      return true; // blocked
    }
    timestamps.push(now);
    return false; // allowed
  };
}

// ── Search query sanitizer ──

/**
 * Sanitize a search query:
 * - Trim whitespace
 * - Remove special regex characters
 * - Limit to 100 characters
 */
export function sanitizeSearchQuery(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '')
    .slice(0, 100);
}

// ── Payment field sanitizers ──

/**
 * Sanitize a card number: keep only digits, max 16.
 */
export function sanitizeCardNumber(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\D/g, '').slice(0, 16);
}

/**
 * Sanitize an expiry field: keep only digits and /, format as MM/YY.
 */
export function sanitizeExpiry(str) {
  if (typeof str !== 'string') return '';
  const digits = str.replace(/[^0-9]/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

/**
 * Sanitize a CVC field: keep only digits, max 4.
 */
export function sanitizeCVC(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\D/g, '').slice(0, 4);
}

// ── Address sanitizer ──

/**
 * Sanitize an address field:
 * - Trim whitespace
 * - Remove HTML tags
 * - Max 200 characters
 */
export function sanitizeAddress(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>/g, '')
    .slice(0, 200);
}

// ── Validation helpers ──

/**
 * Validate an email address (basic regex check).
 */
export function validateEmail(str) {
  if (typeof str !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

/**
 * Validate a phone number:
 * - Allows +, digits, spaces, dashes
 * - Minimum 9 digits
 */
export function validatePhone(str) {
  if (typeof str !== 'string') return false;
  // Check that only allowed characters are present
  if (!/^[+\d\s\-()]+$/.test(str.trim())) return false;
  // Count actual digits
  const digitCount = (str.match(/\d/g) || []).length;
  return digitCount >= 9;
}

// ── Key-based rate limiter ──

const _rateLimiterStore = {};

/**
 * Client-side rate limiter keyed by an arbitrary string.
 * Returns { allowed: boolean, retryAfterMs: number }.
 */
export function rateLimiter(key, maxPerMinute = 30) {
  const now = Date.now();
  const windowMs = 60000;

  if (!_rateLimiterStore[key]) {
    _rateLimiterStore[key] = [];
  }

  const timestamps = _rateLimiterStore[key];

  // Remove expired entries
  while (timestamps.length && timestamps[0] <= now - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= maxPerMinute) {
    const retryAfterMs = timestamps[0] + windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Debounced validator — returns validation errors after user stops typing.
 */
export function validateBookingForm({ address, description, selectedDate, selectedTime }) {
  const errors = {};

  if (!address || address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }
  if (address && address.length > 300) {
    errors.address = 'Address too long (max 300 characters)';
  }

  if (description && description.length > 2000) {
    errors.description = 'Description too long (max 2000 characters)';
  }

  if (!selectedDate) {
    errors.date = 'Please select a date';
  } else {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (selectedDate < now) {
      errors.date = 'Date cannot be in the past';
    }
  }

  if (!selectedTime) {
    errors.time = 'Please select a time slot';
  }

  return errors;
}
