'use client';
import { Conversation } from '@/hooks/useConversations';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({ conversations, activeId, loading, onSelect, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex-1 px-3 py-2 space-y-2" data-testid="conv-loading">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-white/4 animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 px-4 py-6 text-center">
        <p className="text-xs text-[#555570]">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" data-testid="conv-list">
      {conversations.map((conv) => (
        <div
          key={conv._id}
          className={`group flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer transition-all ${
            activeId === conv._id
              ? 'bg-indigo-500/15 text-white'
              : 'text-[#9999b3] hover:bg-white/5 hover:text-white'
          }`}
          onClick={() => onSelect(conv._id)}
          data-testid="conv-item"
        >
          <svg className="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="flex-1 truncate text-sm">{conv.title}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(conv._id); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#555570] hover:text-red-400 transition-all"
            data-testid="delete-conv"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
