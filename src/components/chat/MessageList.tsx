'use client';
import { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useMessages';

interface Props {
  messages: Message[];
  loading: boolean;
  streaming: boolean;
}

export function MessageList({ messages, loading, streaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#555570] text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#555570] text-sm">
        Send a message to start the conversation
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-testid="message-list">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}
      {streaming && (
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#555570] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#555570] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#555570] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'step') {
    return (
      <div className="flex items-center gap-2 text-xs text-[#555570] py-0.5" data-testid="step-msg">
        <div className="w-1 h-1 rounded-full bg-indigo-500/60 animate-pulse" />
        <span className="font-mono">{message.content}</span>
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end" data-testid="user-msg">
        <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-br-md bg-indigo-600 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3" data-testid="assistant-msg">
      <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-tl-md bg-[#1e1e2e] border border-[#2e2e4e] text-[#d4d4e8] text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  );
}
