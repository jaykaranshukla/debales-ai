'use client';
import { useQuery } from '@tanstack/react-query';

export type DashboardData = {
  config: {
    _id: string;
    title: string;
    sections: Array<{
      id: string;
      title: string;
      order: number;
      widgets: Array<{
        id: string;
        type: 'stats_card' | 'integration_status' | 'recent_conversations' | 'activity_feed';
        label: string;
        dataKey?: string;
        order: number;
      }>;
    }>;
  };
  stats: {
    totalConversations: number;
    activeUsers: number;
    messagesToday: number;
    totalMessages: number;
  };
  recentConversations: Array<{
    _id: string;
    title: string;
    updatedAt: string;
  }>;
  integrations: Array<{
    _id: string;
    type: 'shopify' | 'crm';
    name: string;
    enabled: boolean;
  }>;
};

async function fetchDashboard(projectSlug: string): Promise<DashboardData> {
  const res = await fetch(`/api/admin/${projectSlug}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export function useDashboard(projectSlug: string) {
  return useQuery({
    queryKey: ['dashboard', projectSlug],
    queryFn: () => fetchDashboard(projectSlug),
    staleTime: 60_000,
  });
}
