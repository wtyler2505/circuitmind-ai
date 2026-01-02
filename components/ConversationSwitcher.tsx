/**
 * ConversationSwitcher Component
 *
 * Dropdown for managing conversation sessions:
 * - Primary conversation always at top
 * - Recent conversations below
 * - Create new conversation
 * - Delete/rename options
 */

import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '../types';

interface ConversationSwitcherProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSwitchConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

const ConversationSwitcher: React.FC<ConversationSwitcherProps> = ({
  conversations,
  activeConversationId,
  onSwitchConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Sort conversations: primary first, then by updatedAt
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return b.updatedAt - a.updatedAt;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      onDeleteConversation(id);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/70 hover:bg-slate-800/70 cut-corner-sm text-[11px] text-slate-200 border border-slate-700/80 transition-colors"
      >
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="max-w-[150px] truncate">{activeConversation?.title || 'New Chat'}</span>
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 panel-surface panel-frame cut-corner-sm border border-slate-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
          {/* New Conversation Button */}
          <button
            onClick={() => {
              onCreateConversation();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] text-cyan-300 hover:text-white hover:bg-slate-900/70 transition-colors border-b border-slate-800/80 uppercase tracking-[0.2em]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Conversation
          </button>

          {/* Conversation List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  if (editingId !== conv.id) {
                    onSwitchConversation(conv.id);
                    setIsOpen(false);
                  }
                }}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  conv.id === activeConversationId
                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-900/70 border-l-2 border-transparent'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {conv.isPrimary ? (
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  )}
                </div>

                {/* Title / Edit Input */}
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveEdit}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-0.5 bg-slate-900 border border-cyan-500 cut-corner-sm text-[11px] text-white focus:outline-none"
                    />
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-200 truncate">{conv.title}</div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400">
                        <span>{conv.messageCount} messages</span>
                        <span>·</span>
                        <span>{formatDate(conv.updatedAt)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions (visible on hover) */}
                {editingId !== conv.id && (
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEdit(conv, e)}
                      className="p-1 text-gray-300 hover:text-white transition-colors"
                      title="Rename"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    {!conv.isPrimary && (
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {conversations.length === 0 && (
            <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
              No conversations yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationSwitcher;
