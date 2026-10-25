'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Activity, BellRing, MessageSquareText, Volume2 } from 'lucide-react';

import {
  ALERT_CONSENT_VERSION,
  ALERT_SETTINGS_KEY,
  ALERT_SETTINGS_EVENT,
  defaultAlertPreferences,
  readAlertPreferences,
  saveAlertPreferences,
  type AlertPreferences
} from '@/features/admin/lib/notification-preferences';

function Toggle({ label, details, checked, onChange }: {
  label: string;
  details: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-border py-4">
      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs leading-5 text-muted">{details}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="size-4 shrink-0 accent-emerald-600"
      />
    </label>
  );
}

function subscribePreferences(callback: () => void) {
  window.addEventListener(ALERT_SETTINGS_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(ALERT_SETTINGS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function preferenceSnapshot(userId: string) {
  try {
    return window.localStorage.getItem(`${ALERT_SETTINGS_KEY}:${userId}`);
  } catch {
    return null;
  }
}

function subscribePermission(callback: () => void) {
  window.addEventListener('focus', callback);
  window.addEventListener('rcentz:notification-permission-changed', callback);

  return () => {
    window.removeEventListener('focus', callback);
    window.removeEventListener('rcentz:notification-permission-changed', callback);
  };
}

function getPermission() {
  return 'Notification' in window
    ? Notification.permission
    : 'unsupported';
}

export function AdminNotificationPreferences({ userId }: { userId: string }) {
  const snapshot = useSyncExternalStore(
    subscribePreferences,
    () => preferenceSnapshot(userId),
    () => '__server__'
  );

  const preferences = useMemo<AlertPreferences>(
    () => snapshot === '__server__'
      ? defaultAlertPreferences
      : readAlertPreferences(userId),
    [snapshot, userId]
  );

  const permission = useSyncExternalStore(
    subscribePermission,
    getPermission,
    () => 'unsupported'
  );

  const [message, setMessage] = useState('');

  function update(change: Partial<AlertPreferences>) {
    const next = { ...preferences, ...change };
    saveAlertPreferences(userId, next);
  }

  function decide(accept: boolean) {
    update({
      consent: accept ? 'accepted' : 'declined',
      consentAt: new Date().toISOString(),
      consentVersion: ALERT_CONSENT_VERSION,
      desktop: accept ? preferences.desktop : false,
      sound: accept ? preferences.sound : false
    });
    setMessage(accept
      ? 'Preference consent saved on this browser. Choose Enable desktop notifications to request browser permission.'
      : 'Optional notification activation declined. You can change this here at any time.');
  }

  async function enableDesktop() {
    if (!('Notification' in window)) {
      setMessage('This browser does not support desktop notifications.');
      return;
    }
    if (!window.isSecureContext) {
      setMessage('Desktop notifications require HTTPS or a trusted local development origin.');
      return;
    }
    if (Notification.permission === 'denied') {
      setMessage('Notifications are blocked in browser settings. Change the site permission there to enable them.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      window.dispatchEvent(
        new Event('rcentz:notification-permission-changed')
      );
      update({ desktop: result === 'granted', ...(result === 'granted' ? { consent: 'accepted' as const, consentVersion: ALERT_CONSENT_VERSION, consentAt: new Date().toISOString() } : {}) });
      setMessage(result === 'granted'
        ? 'Desktop notifications enabled while this application is open.'
        : 'Desktop notifications were not enabled. In-app activity remains available.');
    } catch {
      setMessage('The browser could not request notification permission.');
    }
  }

  if (snapshot === '__server__') return <section className="rounded-2xl border border-border p-5"><h2 className="font-semibold">Notifications &amp; Alerts</h2><p className="mt-2 text-sm text-muted">Loading browser preferences???</p></section>;

  const needsConsent = preferences.consentVersion !== ALERT_CONSENT_VERSION || preferences.consent === null;

  return (
    <section className="rounded-2xl border border-border p-5" aria-labelledby="alert-settings-title">
      <div className="flex items-center gap-2">
        <BellRing aria-hidden="true" className="size-5 text-theme-accent" />
        <h2 id="alert-settings-title" className="font-semibold">Notifications &amp; Alerts</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">Control optional operational notifications, customer message indicators, alert sounds and browser permissions.</p>

      {needsConsent ? (
        <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold">Stay informed with Rcentz Systems</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Receive optional operational notifications about project updates, milestones, service requests, system activity and other events requiring your attention.
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            You can control which alerts you receive and change your choices at any time. Declining does not restrict access to the workspace. Browser permission is requested only when you explicitly enable desktop notifications.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide(true)} className="rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background">Accept optional alerts</button>
            <button type="button" onClick={() => decide(false)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium">Not now</button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">Optional alert consent: {preferences.consent === 'accepted' ? 'Accepted' : 'Declined'} ?? {preferences.consentVersion}</p>
      )}

      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="size-4 text-emerald-500" />Customer Messages</div>
        <Toggle label="Message indicators" details="Enable optional message sound and desktop alerts. In-app unread counters remain visible." checked={preferences.messages} onChange={messages => update({ messages })} />
        <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4" />System Activity</div>
        <Toggle label="Operational indicators" details="Enable optional system activity sound and desktop alerts. Operational records remain accessible." checked={preferences.operational} onChange={operational => update({ operational })} />
        <div className="flex items-center gap-2 text-sm font-semibold"><Volume2 className="size-4" />Delivery preferences</div>
        <Toggle label="Alert sound" details="Play a short sound for newly detected activity while this app is open. Audio may require a user gesture after each browser session." checked={preferences.sound} onChange={sound => update({ sound, consent: sound ? 'accepted' : preferences.consent, consentVersion: sound ? ALERT_CONSENT_VERSION : preferences.consentVersion, consentAt: sound ? new Date().toISOString() : preferences.consentAt })} />
        <Toggle label="Desktop notifications" details="Show optional browser notifications while this application is open. This is not background push delivery." checked={preferences.desktop && permission === 'granted'} onChange={checked => {
          if (!checked) update({ desktop: false });
          else void enableDesktop();
        }} />
      </div>
      <p className="mt-2 text-xs text-muted">Browser permission: {permission}. Notification preferences and consent choices are currently stored on this device, not synchronized to your account.</p>
      {message ? <p role="status" className="mt-3 rounded-lg border border-border p-3 text-xs">{message}</p> : null}
      <button type="button" onClick={() => {
        update({ ...defaultAlertPreferences, consent: 'declined', consentVersion: ALERT_CONSENT_VERSION, consentAt: new Date().toISOString() });
        setMessage('Optional alerts disabled on this browser. Browser-level permission may also be revoked in your browser settings.');
      }} className="mt-4 text-xs font-medium text-muted underline underline-offset-4">Withdraw optional alert consent</button>
    </section>
  );
}
