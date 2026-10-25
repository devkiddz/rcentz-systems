export const ALERT_SETTINGS_KEY = 'rcentz:admin-alert-preferences:v1';
export const ALERT_SETTINGS_EVENT = 'rcentz:admin-alert-preferences-changed';
export const ALERT_CONSENT_VERSION = '2026-10-24-v1';

export type AlertPreferences = {
  messages: boolean;
  operational: boolean;
  sound: boolean;
  desktop: boolean;
  consent: 'accepted' | 'declined' | null;
  consentVersion: string | null;
  consentAt: string | null;
};

export const defaultAlertPreferences: AlertPreferences = {
  messages: true,
  operational: true,
  sound: false,
  desktop: false,
  consent: null,
  consentVersion: null,
  consentAt: null
};

export function readAlertPreferences(userId: string): AlertPreferences {
  if (typeof window === 'undefined') return defaultAlertPreferences;
  try {
    const value = window.localStorage.getItem(`${ALERT_SETTINGS_KEY}:${userId}`);
    if (!value) return defaultAlertPreferences;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return defaultAlertPreferences;
    const record = parsed as Partial<AlertPreferences>;
    return {
      messages: typeof record.messages === 'boolean' ? record.messages : true,
      operational: typeof record.operational === 'boolean' ? record.operational : true,
      sound: record.sound === true,
      desktop: record.desktop === true,
      consent: record.consent === 'accepted' || record.consent === 'declined' ? record.consent : null,
      consentVersion: typeof record.consentVersion === 'string' ? record.consentVersion : null,
      consentAt: typeof record.consentAt === 'string' ? record.consentAt : null
    };
  } catch {
    return defaultAlertPreferences;
  }
}

export function saveAlertPreferences(userId: string, value: AlertPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${ALERT_SETTINGS_KEY}:${userId}`, JSON.stringify(value));
    window.dispatchEvent(new Event(ALERT_SETTINGS_EVENT));
  } catch {
    // Continue to work without browser storage.
  }
}
