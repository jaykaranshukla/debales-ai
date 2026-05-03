'use client';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder = 'Type a message...' }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) textareaRef.current.focus();
  }, [disabled]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  return (
    <div className="flex items-end gap-3 bg-[#1a1a2e] border border-[#2e2e4e] rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => { setValue(e.target.value); autoResize(); }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-[#555570] text-sm resize-none outline-none leading-relaxed disabled:opacity-50 max-h-40"
        data-testid="message-input"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        data-testid="send-btn"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}
