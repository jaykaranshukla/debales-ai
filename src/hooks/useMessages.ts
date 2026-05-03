'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Message = {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'step';
  content: string;
  createdAt: string;
};

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  return data.messages;
}

async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ messages: Message[] }> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 0,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: (data) => {
      qc.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        ...data.messages,
      ]);
    },
  });
}
