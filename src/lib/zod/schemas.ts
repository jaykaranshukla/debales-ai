import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Projects ─────────────────────────────────────────────────────────────────
export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().max(500).optional().default(''),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ─── Conversations ────────────────────────────────────────────────────────────
export const CreateConversationSchema = z.object({
  productInstanceId: z.string().min(1),
  title: z.string().max(200).optional().default('New Conversation'),
});
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;

export const ConversationQuerySchema = z.object({
  projectSlug: z.string().min(1),
  productInstanceId: z.string().optional(),
});
export type ConversationQuery = z.infer<typeof ConversationQuerySchema>;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

// ─── Integrations ─────────────────────────────────────────────────────────────
export const ToggleIntegrationSchema = z.object({
  type: z.enum(['shopify', 'crm']),
  enabled: z.boolean(),
});
export type ToggleIntegrationInput = z.infer<typeof ToggleIntegrationSchema>;

// ─── Dashboard Config ─────────────────────────────────────────────────────────
export const WidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['stats_card', 'integration_status', 'recent_conversations', 'activity_feed']),
  label: z.string(),
  dataKey: z.string().optional(),
  order: z.number(),
});

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  widgets: z.array(WidgetSchema),
});

export const UpdateDashboardConfigSchema = z.object({
  title: z.string().min(1).max(200),
  sections: z.array(SectionSchema),
});
export type UpdateDashboardConfigInput = z.infer<typeof UpdateDashboardConfigSchema>;
