export type AccessScope = 'all_jobs' | 'assigned_jobs' | 'no_job_access';

export interface TeamRole {
  roleId: string;
  roleKey: string | null;
  name: string;
  description: string;
  roleType: 'system' | 'custom';
  isOwnerRole: boolean;
  isArchived?: boolean;
  permissionKeys: string[];
}

export interface RoleGroup {
  key: string;
  label: string;
  roleKeys: string[];
}

export interface CreateCustomRoleRequest {
  name: string;
  description?: string;
  permissionKeys: string[];
  cloneFromRoleId?: string;
}

export interface UpdateCustomRoleRequest {
  name?: string;
  description?: string;
  permissionKeys?: string[];
}

export interface AuditLogEntry {
  auditLogId: string;
  actorUid: string;
  actorEmail?: string;
  targetUid?: string;
  targetEmail?: string;
  eventType: string;
  before?: any;
  after?: any;
  createdAt: Date;
}

export interface PermissionDef {
  key: string;
  category: string;
  description: string;
  sensitive?: boolean;
}

export interface JobAssignmentSummary {
  jobId: string;
  jobTitle: string;
}

export interface TeamInvitation {
  invitationId: string;
  email: string;
  roleName: string;
  accessScope: AccessScope;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invitedAt: Date;
  expiresAt: Date;
}

export interface InviteMemberRequest {
  email: string;
  roleId: string;
  accessScope: AccessScope;
  jobIds?: string[];
}

export interface UpdateMemberRequest {
  roleId?: string;
  accessScope?: AccessScope;
  jobIds?: string[];
}

export interface InviteResultItem {
  email: string;
  status: 'success' | 'failed';
  invitationId?: string;
  msg?: string;
}

export interface AssignableJob {
  jobId: string;
  jobTitle: string;
  jobStatusId: number;
}
