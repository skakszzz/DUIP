export type ItemType = 'TODO' | 'WISH' | 'ETC';
export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'oneshot';
export type SoilType = 'rich' | 'granite' | 'sand' | 'moss';
export type TreeType = 'cherry' | 'olive' | 'ginkgo' | 'pine' | 'maple';

export interface RecurrenceRule {
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  weekdays?: number[];
  monthDay?: number;
  monthPattern?: { week: 1 | 2 | 3 | 4 | 'last'; weekday: number };
  yearMonth?: number;
  yearDay?: number;
  lunar?: boolean;
  interval?: number;
  endDate?: string;
  occurrencesLimit?: number;
}

export interface Workspace {
  id: string;
  name: string;
  treeType: TreeType;
  anniversary: string | null;
  ownerId: string;
  createdAt: string;
}

export interface Membership {
  workspaceId: string;
  userId: string;
  displayName: string;
  avatar: string;
  color: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface Item {
  id: string;
  workspaceId: string;
  ownerUserId: string | null;
  title: string;
  description?: string;
  type: ItemType;
  timeframe: Timeframe;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  eventDate?: string;
  eventLunarDate?: string;
  isShared?: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPot {
  id: string;
  workspaceId: string;
  year: number;
  month: number;
  plantId: string | null;
  soilType: SoilType;
  growthPoints: number;
  selectedAt?: string;
}

export interface Invite {
  token: string;
  workspaceId: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}
