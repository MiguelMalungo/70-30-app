import { useState, useCallback } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * usePushNotifications — manages web push subscription.
 * Requests permission, subscribes via the service worker,
 * and sends the subscription to the backend.
 */
export default function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;

      // Check existing subscription
      let sub = await reg.pushManager.getSubscription();
      if (!sub && VAPID_PUBLIC_KEY) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Send subscription to backend
      if (sub) {
        try {
          await fetch(`${API_URL}/push/subscribe/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub.toJSON()),
            credentials: 'include',
          });
        } catch {
          // Backend may not be available yet — subscription still saved in browser
        }
        setSubscribed(true);
        return true;
      }
    } catch (err) {
      console.warn('Push subscription failed:', err);
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  return { permission, subscribed, loading, subscribe };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
