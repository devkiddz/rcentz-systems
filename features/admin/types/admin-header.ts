export type AdminHeaderNotification = {
  id: string;
  type: string;

  title: string;
  message: string;

  href: string | null;

  unread: boolean;
  timeLabel: string;
};

export type AdminHeaderMessage = {
  id: string;
  latestMessageId: string | null;

  title: string;

  senderName: string;
  senderImage: string | null;

  preview: string;

  unread: boolean;
  timeLabel: string;
};

export type AdminHeaderFeed = {
  notifications: AdminHeaderNotification[];
  unreadNotificationCount: number;

  messages: AdminHeaderMessage[];
  hasUnreadMessages: boolean;
};