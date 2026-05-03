'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ConversationSidebar } from './ConversationSidebar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
} from '@/hooks/useConversations';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  project: { id: string; name: string; slug: string };
  productInstances: Array<{ id: string; name: string; productType: string }>;
  defaultProductInstanceId: string;
  isAdmin: boolean;
  user: { id: string; name: string; email: string };
}

export function ChatShell({ project, productInstances, defaultProductInstanceId, isAdmin, user }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: conversations = [], isLoading: loadingConvs } = useConversations(project.slug);
  const { data: messages = [], isLoading: loadingMsgs } = useMessages(activeConvId);
  const createConv = useCreateConversation(project.slug);
  const deleteConv = useDeleteConversation(project.slug);
  const sendMsg = useSendMessage(activeConvId ?? '');
  const queryClient = useQueryClient();

  const handleNewChat = useCallback(async () => {
    if (!defaultProductInstanceId) return;
    const conv = await createConv.mutateAsync(defaultProductInstanceId);
    setActiveConvId(conv._id);
  }, [createConv, defaultProductInstanceId]);

  const handleSend = useCallback(
  async (content: string) => {
    if (!activeConvId) {
      if (!defaultProductInstanceId) return;
      const conv = await createConv.mutateAsync(defaultProductInstanceId);
      setActiveConvId(conv._id);
      // Use conv._id directly — don't rely on sendMsg which still has old null id
      const res = await fetch(`/api/conversations/${conv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        // Invalidate to reload messages
        await queryClient.invalidateQueries({ queryKey: ['messages', conv._id] });
      }
    } else {
      await sendMsg.mutateAsync(content);
    }
     },
      [activeConvId, createConv, defaultProductInstanceId, sendMsg, queryClient]
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden" data-testid="chat-shell">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-[#1e1e2e] bg-[#0d0d14] transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
        data-testid="conversation-sidebar"
      >
        {/* Project header */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1e1e2e]">
          <div className="w-7 h-7 rounded-md bg-indigo-500/25 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0">
            {project.name[0].toUpperCase()}
          </div>
          <span className="font-medium text-sm text-white truncate">{project.name}</span>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={handleNewChat}
            disabled={createConv.isPending}
            data-testid="new-chat-btn"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9999b3] hover:text-white hover:bg-white/5 border border-white/8 hover:border-white/15 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Conversation list */}
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConvId}
          loading={loadingConvs}
          onSelect={setActiveConvId}
          onDelete={(id) => {
            deleteConv.mutate(id);
            if (activeConvId === id) setActiveConvId(null);
          }}
        />

        {/* Bottom nav */}
        <div className="mt-auto border-t border-[#1e1e2e] p-3 space-y-1">
          {isAdmin && (
            <Link
              href={`/projects/${project.slug}/admin`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9999b3] hover:text-white hover:bg-white/5 transition-all"
              data-testid="admin-link"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#555570] hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All projects
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#555570] hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-[#555570] hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm text-[#9999b3]">
            {activeConvId
              ? conversations.find((c) => c._id === activeConvId)?.title ?? 'Conversation'
              : 'New conversation'}
          </span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col" data-testid="message-area">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-medium text-white">Start a conversation</h2>
                <p className="text-sm text-[#555570] mt-1 max-w-sm">
                  Ask anything — product info, sales data, customer records. Your AI assistant is ready.
                </p>
              </div>
              <button
                onClick={handleNewChat}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Start chatting
              </button>
            </div>
          ) : (
            <MessageList
              messages={messages}
              loading={loadingMsgs}
              streaming={sendMsg.isPending}
            />
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#1e1e2e] p-4">
          <MessageInput
            onSend={handleSend}
            disabled={sendMsg.isPending || createConv.isPending}
            placeholder={activeConvId ? 'Ask your AI assistant...' : 'Start a new conversation...'}
          />
        </div>
      </main>
    </div>
  );
}
