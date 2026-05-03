'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Conversation = {
  _id: string;
  title: string;
  projectId: string;
  userId: string;
  productInstanceId: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchConversations(projectSlug: string): Promise<Conversation[]> {
  const res = await fetch(`/api/conversations?projectSlug=${projectSlug}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const data = await res.json();
  return data.conversations;
}

async function createConversation(
  projectSlug: string,
  productInstanceId: string
): Promise<Conversation> {
  const res = await fetch(`/api/conversations?projectSlug=${projectSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productInstanceId, title: 'New Conversation' }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  const data = await res.json();
  return data.conversation;
}

async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export function useConversations(projectSlug: string) {
  return useQuery({
    queryKey: ['conversations', projectSlug],
    queryFn: () => fetchConversations(projectSlug),
    staleTime: 30_000,
  });
}

export function useCreateConversation(projectSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productInstanceId: string) =>
      createConversation(projectSlug, productInstanceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations', projectSlug] }),
  });
}

export function useDeleteConversation(projectSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations', projectSlug] }),
  });
}
