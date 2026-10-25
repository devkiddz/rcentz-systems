'use client';

import { useEffect, useRef } from 'react';
import type { AdminHeaderFeed } from '@/features/admin/types/admin-header';
import {
  ALERT_SETTINGS_EVENT,
  ALERT_SETTINGS_KEY,
  readAlertPreferences,
  type AlertPreferences
} from '@/features/admin/lib/notification-preferences';

type Props = { feed: AdminHeaderFeed; userId: string };

function unreadKeys(feed: AdminHeaderFeed, settings: AlertPreferences): Set<string> {
  return new Set([
    ...(settings.operational ? feed.notifications.filter(item => item.unread).map(item => `notification:${item.id}`) : []),
    ...(settings.messages ? feed.messages.filter(item => item.unread && item.latestMessageId).map(item => `message:${item.latestMessageId}`) : [])
  ]);
}

function playChime(context: AudioContext) {
  if (context.state !== 'running') return;
  const start = context.currentTime + 0.01;
  for (const [index, frequency] of [660, 880].entries()) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const begin = start + index * 0.11;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(0.035, begin + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + 0.15);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(begin + 0.16);
  }
}

export function AdminHeaderAlertSound({ feed, userId }: Props) {
  const contextRef = useRef<AudioContext | null>(null);
  const previousRef = useRef<Set<string> | null>(null);
  const settingsRef = useRef<AlertPreferences | null>(null);

  useEffect(() => {
    function updateSettings() {
      settingsRef.current = readAlertPreferences(userId);
      // Changing preferences is not a new arrival.
      previousRef.current = null;
      if (settingsRef.current.sound && !contextRef.current) {
        try { contextRef.current = new AudioContext(); } catch { /* Audio unsupported. */ }
      }
      if (settingsRef.current.sound && contextRef.current) {
        void contextRef.current.resume().catch(() => {});
      }
    }
    updateSettings();
    window.addEventListener(ALERT_SETTINGS_EVENT, updateSettings);
    function onStorage(event: StorageEvent) {
      if (event.key === `${ALERT_SETTINGS_KEY}:${userId}`) updateSettings();
    }
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ALERT_SETTINGS_EVENT, updateSettings);
      window.removeEventListener('storage', onStorage);
      const context = contextRef.current;
      contextRef.current = null;
      if (context) void context.close().catch(() => {});
    };
  }, [userId]);

  useEffect(() => {
    const settings = settingsRef.current ?? readAlertPreferences(userId);
    const next = unreadKeys(feed, settings);
    const previous = previousRef.current;
    const newItems = previous === null ? [] : [...next].filter(key => !previous.has(key));
    previousRef.current = next;
    if (newItems.length === 0 || document.visibilityState !== 'visible') return;
    if (settings.sound && contextRef.current?.state === 'running') playChime(contextRef.current);
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const label = newItems.some(item => item.startsWith('message:')) ? 'New customer message' : 'New operational activity';
        // Do not expose message content in operating-system previews.
        new Notification('Rcentz Systems', { body: label, tag: `rcentz-admin-${newItems[0]}` });
      } catch { /* Notifications may be unavailable despite permission. */ }
    }
  }, [feed, userId]);

  return null;
}
