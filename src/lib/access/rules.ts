import { Membership } from '@/types/next-auth';

/**
 * Pure access rules — zero DB calls, zero side effects.
 * These are the single source of truth for authorization decisions.
 */

/** Check if a user is a member (any role) of a given project */
export function canAccessProject(
  userId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  return memberships.some((m) => m.projectId === projectId);
}

/** Check if a user is an admin of a given project */
export function isProjectAdmin(
  userId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  return memberships.some((m) => m.projectId === projectId && m.role === 'admin');
}

/** Check if user can read a specific conversation (they own it or are admin of the project) */
export function canAccessConversation(
  userId: string,
  conversationUserId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  if (userId === conversationUserId) return true;
  return isProjectAdmin(userId, projectId, memberships);
}

/** Check if user can send messages in a conversation */
export function canSendMessage(
  userId: string,
  conversationUserId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  return canAccessConversation(userId, conversationUserId, projectId, memberships);
}

/** Check if user can access the admin dashboard */
export function canAccessAdminDashboard(
  userId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  return isProjectAdmin(userId, projectId, memberships);
}

/** Check if user can toggle integrations */
export function canManageIntegrations(
  userId: string,
  projectId: string,
  memberships: Membership[]
): boolean {
  return isProjectAdmin(userId, projectId, memberships);
}
