export type ActivityItem = {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  unread?: boolean;
};
export type ActivityFeed = {
  accountKey: string;
  counts: { notifications: number; activities: number; messages: number };
  notifications: ActivityItem[];
  activities: ActivityItem[];
  messages: ActivityItem[];
};
