import { EngagementPriority, NotificationCategory, NotificationStatus } from './engagement-contract.models';
/** Wire DTOs from codex/subscription-engagement, SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md. */
export interface EmployerAction { type?: 'PRIMARY' | 'SECONDARY'; label: string; action: 'NAVIGATE'; url: string; }
export interface EmployerRecommendation { currentPlan?: string; recommendedPlan: string | null; reasonCodes: string[]; confidence: string; eligible?: boolean; activation?: string; planVersion?: string; }
export interface EmployerMessage {
  id: string | null; kind: string; trigger: string; priority: EngagementPriority;
  presentation: { recommendedSurface: string; dismissible: boolean };
  copy: { eyebrow: string; title: string; body: string };
  usage: { used: number; limit: number; unit: 'BYTES' | 'COUNT'; percentage: number } | null;
  recommendation: EmployerRecommendation | null; actions: EmployerAction[];
}
export interface EmployerContextResponse { success: boolean; banner: EmployerMessage | null; dashboardCard: EmployerMessage | null; availability?: 'PENDING_EVALUATION'; }
export interface EmployerNotification {
  id: string; category: NotificationCategory; type: string; priority: EngagementPriority;
  title: string; body: string; cta: {primary: EmployerAction | null; secondary: EmployerAction | null};
  metadata: Record<string, unknown>; surfaces: string[]; status: NotificationStatus; createdAt: string; read: boolean;
}
export interface EmployerNotificationResponse { success: boolean; items: EmployerNotification[]; unreadCount: number; page: number; limit: number; }
export interface EmployerInteractionResponse { success: boolean; updated: boolean; }
