'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Integration = {
  _id: string;
  type: 'shopify' | 'crm';
  name: string;
  enabled: boolean;
};

async function fetchIntegrations(projectSlug: string): Promise<Integration[]> {
  const res = await fetch(`/api/admin/${projectSlug}/integrations`);
  if (!res.ok) throw new Error('Failed to fetch integrations');
  const data = await res.json();
  return data.integrations;
}

async function toggleIntegration(
  projectSlug: string,
  type: 'shopify' | 'crm',
  enabled: boolean
): Promise<Integration> {
  const res = await fetch(`/api/admin/${projectSlug}/integrations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, enabled }),
  });
  if (!res.ok) throw new Error('Failed to toggle integration');
  const data = await res.json();
  return data.integration;
}

export function useIntegrations(projectSlug: string) {
  return useQuery({
    queryKey: ['integrations', projectSlug],
    queryFn: () => fetchIntegrations(projectSlug),
    staleTime: 30_000,
  });
}

export function useToggleIntegration(projectSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, enabled }: { type: 'shopify' | 'crm'; enabled: boolean }) =>
      toggleIntegration(projectSlug, type, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations', projectSlug] });
      qc.invalidateQueries({ queryKey: ['dashboard', projectSlug] });
    },
  });
}
