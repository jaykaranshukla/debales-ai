import { connectDB } from '@/lib/db/connect';
import { DashboardConfig, IDashboardConfig } from '@/lib/db/models/DashboardConfig';
import { Conversation } from '@/lib/db/models/Conversation';
import { Message } from '@/lib/db/models/Message';
import { User } from '@/lib/db/models/User';
import { Integration } from '@/lib/db/models/Integration';

export type DashboardStats = {
  totalConversations: number;
  activeUsers: number;
  messagesToday: number;
  totalMessages: number;
};

export const dashboardService = {
  async getConfig(projectId: string): Promise<IDashboardConfig | null> {
    await connectDB();
    return DashboardConfig.findOne({ projectId }).lean();
  },

  async getStats(projectId: string): Promise<DashboardStats> {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalConversations, totalMessages, messagesToday] = await Promise.all([
      Conversation.countDocuments({ projectId }),
      Message.countDocuments({
        conversationId: {
          $in: await Conversation.distinct('_id', { projectId }),
        },
      }),
      Message.countDocuments({
        conversationId: {
          $in: await Conversation.distinct('_id', { projectId }),
        },
        createdAt: { $gte: today },
      }),
    ]);

    const uniqueUserIds = await Conversation.distinct('userId', { projectId });

    return {
      totalConversations,
      activeUsers: uniqueUserIds.length,
      messagesToday,
      totalMessages,
    };
  },

  async createDefaultConfig(projectId: string, projectName: string): Promise<IDashboardConfig> {
    await connectDB();
    const config = await DashboardConfig.create({
      projectId,
      title: `${projectName} — Admin Dashboard`,
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          order: 1,
          widgets: [
            { id: 'w1', type: 'stats_card', label: 'Total Conversations', dataKey: 'totalConversations', order: 1 },
            { id: 'w2', type: 'stats_card', label: 'Active Users', dataKey: 'activeUsers', order: 2 },
            { id: 'w3', type: 'stats_card', label: 'Messages Today', dataKey: 'messagesToday', order: 3 },
            { id: 'w4', type: 'stats_card', label: 'Total Messages', dataKey: 'totalMessages', order: 4 },
          ],
        },
        {
          id: 'integrations',
          title: 'Integrations',
          order: 2,
          widgets: [
            { id: 'w5', type: 'integration_status', label: 'Shopify Integration', order: 1 },
            { id: 'w6', type: 'integration_status', label: 'CRM Integration', order: 2 },
          ],
        },
        {
          id: 'activity',
          title: 'Recent Activity',
          order: 3,
          widgets: [
            { id: 'w7', type: 'recent_conversations', label: 'Recent Conversations', order: 1 },
          ],
        },
      ],
    });
    return config.toObject();
  },
};
