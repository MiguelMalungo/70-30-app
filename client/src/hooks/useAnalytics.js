import { useCallback, useEffect, useRef } from 'react';

/**
 * Analytics event tracker.
 *
 * Logs structured events to console in dev, and can be wired to
 * Google Analytics / Mixpanel / PostHog by replacing the `dispatch` function.
 *
 * Usage:
 *   const { track, trackPageView } = useAnalytics();
 *   track('booking_started', { category: 'plumbing' });
 */

const EVENT_QUEUE = [];
const SESSION_ID = Math.random().toString(36).slice(2, 10);
let pageViewCount = 0;

function dispatch(event) {
  // ── Production: send to analytics backend ──
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });

  // ── Google Analytics 4 (if loaded) ──
  if (typeof window.gtag === 'function') {
    window.gtag('event', event.name, {
      event_category: event.category || 'general',
      event_label: event.label || '',
      value: event.value || 0,
      ...event.data,
    });
  }

  // ── Dev logging ──
  if (import.meta.env.DEV) {
    console.log(
      `%c[Analytics] ${event.name}`,
      'color: #f97316; font-weight: bold;',
      event.data || ''
    );
  }

  EVENT_QUEUE.push({ ...event, timestamp: Date.now(), session: SESSION_ID });

  // Keep queue bounded
  if (EVENT_QUEUE.length > 200) EVENT_QUEUE.shift();
}

export function useAnalytics() {
  const mountTime = useRef(Date.now());

  const track = useCallback((name, data = {}) => {
    dispatch({ name, data });
  }, []);

  const trackPageView = useCallback((pageName) => {
    pageViewCount++;
    dispatch({
      name: 'page_view',
      data: { page: pageName, view_number: pageViewCount },
    });
  }, []);

  const trackTiming = useCallback((name) => {
    const elapsed = Date.now() - mountTime.current;
    dispatch({ name: `timing_${name}`, data: { duration_ms: elapsed } });
  }, []);

  return { track, trackPageView, trackTiming };
}

// Pre-built event helpers
export const AnalyticsEvents = {
  BOOKING_STARTED: 'booking_started',
  BOOKING_STEP: 'booking_step',
  BOOKING_CONFIRMED: 'booking_confirmed',
  PAYMENT_STARTED: 'payment_started',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_METHOD_SELECTED: 'payment_method_selected',
  MESSAGE_SENT: 'message_sent',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SERVICE_VIEWED: 'service_viewed',
  PRO_PROFILE_VIEWED: 'pro_profile_viewed',
  REVIEW_SUBMITTED: 'review_submitted',
  LANGUAGE_CHANGED: 'language_changed',
  PWA_INSTALLED: 'pwa_installed',
};

export default useAnalytics;
