export type Visibility = "shared" | "private";
export type MembershipRole = "owner" | "member";
export type MembershipStatus = "active" | "invited" | "removed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type BillStatus = "upcoming" | "due" | "overdue" | "paid" | "scheduled";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type DocumentStatus = "valid" | "expiring_soon" | "expired" | "missing";
export type NotificationPriority = "critical" | "high" | "normal" | "low";
export type Frequency =
  | "once"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  home_location: string | null;
  parents_location: string | null;
  timezone: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  display_name: string;
  created_at: string;
}

export interface TaskCategory {
  id: string;
  household_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  owner_id: string | null;
  due_date: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface CalendarEvent {
  id: string;
  household_id: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string | null;
  notes: string | null;
  participants: string[];
  visibility: Visibility;
  owner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  household_id: string;
  name: string;
  provider: string | null;
  amount: number;
  currency: string;
  due_date: string;
  frequency: Frequency;
  category: string | null;
  status: BillStatus;
  owner_id: string | null;
  visibility: Visibility;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Subscription {
  id: string;
  household_id: string;
  name: string;
  provider: string | null;
  amount: number;
  currency: string;
  billing_frequency: Frequency;
  next_renewal: string;
  category: string | null;
  status: SubscriptionStatus;
  owner_id: string | null;
  visibility: Visibility;
  payment_reference: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface DocumentCategory {
  id: string;
  household_id: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  household_id: string;
  title: string;
  category_id: string | null;
  category?: string | null;
  status: DocumentStatus;
  issued_at: string | null;
  expires_at: string | null;
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  owner_id: string | null;
  visibility: Visibility;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Account {
  id: string;
  household_id: string;
  institution: string;
  nickname: string;
  account_type: string;
  reference: string | null;
  last_four: string | null;
  owner_id: string | null;
  visibility: Visibility;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Contact {
  id: string;
  household_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  category: string;
  notes: string | null;
  owner_id: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Place {
  id: string;
  household_id: string;
  name: string;
  address: string | null;
  website: string | null;
  rating: number | null;
  category: string;
  tags: string[];
  notes: string | null;
  visited: boolean;
  owner_id: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ImportantDate {
  id: string;
  household_id: string;
  title: string;
  date: string;
  category: string;
  notes: string | null;
  reminder_days: number | null;
  owner_id: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface HomeItem {
  id: string;
  household_id: string;
  name: string;
  category: string;
  purchased_at: string | null;
  warranty_until: string | null;
  notes: string | null;
  owner_id: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface HomeService {
  id: string;
  household_id: string;
  name: string;
  provider: string | null;
  last_serviced_at: string | null;
  next_due_at: string | null;
  notes: string | null;
  owner_id: string | null;
  visibility: Visibility;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface AppNotification {
  id: string;
  household_id: string;
  user_id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export interface WeatherSnapshot {
  location_label: string;
  temperature_c: number;
  condition: string;
  feels_like_c: number;
  humidity: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  priority: NotificationPriority;
  href: string;
}

export const TASK_CATEGORIES = [
  "Personal",
  "Family",
  "Finance",
  "Home",
  "Work",
  "Health",
  "Travel",
  "Other",
] as const;

export const IMPORTANT_DATE_CATEGORIES = [
  "Birthdays",
  "Anniversaries",
  "Renewals",
  "Travel",
  "Family",
  "Deadlines",
  "Events",
  "Other",
] as const;

export const CONTACT_CATEGORIES = [
  "Family",
  "Friends",
  "Doctors",
  "Service Providers",
  "Schools",
  "Emergency",
  "Other",
] as const;
