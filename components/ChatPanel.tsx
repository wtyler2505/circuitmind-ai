/**
 * ChatPanel Component
 *
 * Main chat container that integrates:
 * - Conversation switching
 * - Message list with rich rendering
 * - Input area with mode selector
 * - Context indicator
 * - Proactive suggestion chips
 */

import React, { useState, useRef, useEffect } from 'react';
import { EnhancedChatMessage, ActionIntent, Conversation, AIContext } from '../types';
import ChatMessage from './ChatMessage';
import ConversationSwitcher from './ConversationSwitcher';
import { aiMetricsService } from '../services/aiMetricsService';

interface ChatPanelProps {
  // Conversation management
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: EnhancedChatMessage[];
  onSwitchConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;

  // Message handling
  onSendMessage: (
    content: string,
    attachment?: { base64: string; type: 'image' | 'video' }
  ) => Promise<void>;
  isLoading?: boolean;
  loadingText?: string;

  // Action handling
  onComponentClick?: (componentId: string) => void;
  onActionClick?: (action: ActionIntent) => void;

  // Context display
  context?: AIContext;

  // Proactive suggestions
  proactiveSuggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;

  // Mode switching
  generationMode?: 'chat' | 'image' | 'video';
  onModeChange?: (mode: 'chat' | 'image' | 'video') => void;

  // Deep thinking toggle
  useDeepThinking?: boolean;
  onDeepThinkingChange?: (enabled: boolean) => void;

  // Panel visibility
  isExpanded?: boolean;
  onToggleExpand?: () => void;

  // Layout overrides
  className?: string;
  headerActions?: React.ReactNode;

  // Voice input
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;

  // Image/video generation controls
  imageSize?: '1K' | '2K' | '4K';
  onImageSizeChange?: (size: '1K' | '2K' | '4K') => void;
  aspectRatio?: string;
  onAspectRatioChange?: (ratio: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  conversations,
  activeConversationId,
  messages,
  onSwitchConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
  onSendMessage,
  isLoading = false,
  loadingText = 'Thinking...',
  onComponentClick,
  onActionClick,
  context,
  proactiveSuggestions = [],
  onSuggestionClick,
  generationMode = 'chat',
  onModeChange,
  useDeepThinking = false,
  onDeepThinkingChange,
  isExpanded = true,
  onToggleExpand,
  className = '',
  headerActions,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  imageSize = '1K',
  onImageSizeChange,
  aspectRatio = '16:9',
  onAspectRatioChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<{ base64: string; type: 'image' | 'video' } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(messages.length === 0);
  const [isQuickActionsPinned, setIsQuickActionsPinned] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isQuickActionsPinned && messages.length > 0) {
      setIsQuickActionsOpen(false);
    }
  }, [messages.length, isQuickActionsPinned]);

  // Handle send
  const handleSend = async () => {
    if (!inputValue.trim() && !attachment) return;

    const content = inputValue.trim();
    setInputValue('');
    const attachmentToSend = attachment;
    setAttachment(null);

    await onSendMessage(content, attachmentToSend || undefined);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setAttachment({ base64, type });
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setAttachment({ base64, type });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuickActionsToggle = () => {
    setIsQuickActionsOpen((prev) => {
      if (prev && isQuickActionsPinned) {
        setIsQuickActionsPinned(false);
      }
      return !prev;
    });
  };

  const handleQuickActionsPin = () => {
    setIsQuickActionsPinned((prev) => {
      const next = !prev;
      if (next) {
        setIsQuickActionsOpen(true);
      }
      return next;
    });
  };

  const handleMessageFeedback = (messageId: string, score: number) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg?.metricId) {
      aiMetricsService.recordFeedback(msg.metricId, score);
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpand}
        className="fixed bottom-4 right-4 h-10 w-10 inline-flex items-center justify-center bg-neon-cyan text-black cut-corner-sm border border-neon-cyan/70 shadow-[0_0_18px_rgba(0,243,255,0.45)] transition-all z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 hover:bg-white"
        title="Open chat"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  const modeAccent =
    generationMode === 'chat'
      ? 'bg-neon-cyan text-black'
      : generationMode === 'image'
        ? 'bg-neon-amber text-black'
        : 'bg-neon-purple text-black';
  const modeLabel = generationMode === 'chat' ? 'Chat' : generationMode === 'image' ? 'Image' : 'Video';
  const containerClassName = `relative flex flex-col h-full panel-surface panel-frame cut-corner-md border border-slate-800/80 border-b-0 ${className}`.trim();
  const quickActions = [
    {
      id: 'draft-wiring',
      label: 'Draft wiring',
      description: 'Propose a safe wiring plan.',
      prompt: 'Draft a safe wiring plan based on my current diagram and inventory.',
      style: 'quick-action--cyan',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
    },
    {
      id: 'check-pins',
      label: 'Check pins',
      description: 'Find conflicts and unsafe pins.',
      prompt: 'Check for pin conflicts or unsafe connections in this diagram.',
      style: 'quick-action--amber',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.74-3L13.74 4c-.77-1.33-2.7-1.33-3.47 0L3.33 16c-.77 1.33.2 3 1.74 3z"
          />
        </svg>
      ),
    },
    {
      id: 'inventory-audit',
      label: 'Inventory gaps',
      description: 'Highlight missing parts.',
      prompt: 'Identify missing parts or substitutions needed for this design.',
      style: 'quick-action--emerald',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M5 7l2 12h10l2-12M9 7V5a3 3 0 016 0v2"
          />
        </svg>
      ),
    },
    {
      id: 'layout-tidy',
      label: 'Tidy layout',
      description: 'Suggest layout improvements.',
      prompt: 'Suggest layout improvements and cleaner routing for the current diagram.',
      style: 'quick-action--purple',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h10M4 18h7"
          />
        </svg>
      ),
    },
  ];
  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    if (onSuggestionClick) {
      onSuggestionClick(prompt);
      return;
    }
    await onSendMessage(prompt);
  };
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateKey === dateKey) {
        lastGroup.items.push(message);
      } else {
        groups.push({ dateKey, items: [message] });
      }
      return groups;
    },
    [] as { dateKey: string; items: EnhancedChatMessage[] }[]
  );
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const formatGroupLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={containerClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 panel-header panel-rail">
        <div className="flex items-center flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.22em] text-slate-400 panel-title">
            <span>AI Assistant</span>
            <span className="h-1 w-1 bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.65)]" />
          </div>
          {/* Conversation Switcher */}
          <ConversationSwitcher
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSwitchConversation={onSwitchConversation}
            onCreateConversation={onCreateConversation}
            onDeleteConversation={onDeleteConversation}
            onRenameConversation={onRenameConversation}
          />

          {/* Context Indicator */}
          {context && (
            <div className="hidden lg:flex items-center gap-1.5 px-1.5 py-0.5 cut-corner-sm text-[8px] text-slate-300 border border-slate-700/70 bg-slate-900/70">
              {context.currentDiagramTitle && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  {context.componentCount}c / {context.connectionCount}w
                </span>
              )}
              {context.selectedComponentName && (
                <span className="flex items-center gap-1 text-cyan-300">
                  → {context.selectedComponentName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCreateConversation}
            className="hidden sm:inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.22em] cut-corner-sm border border-slate-700 bg-slate-900/70 text-slate-300 hover:text-white hover:border-neon-cyan/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Start a new conversation"
            aria-label="Create new conversation"
          >
            <span className="text-neon-cyan">+</span>
            New
          </button>
          {/* Deep Thinking Toggle */}
          {onDeepThinkingChange && (
            <button
              type="button"
              onClick={() => onDeepThinkingChange(!useDeepThinking)}
              className={`h-7 w-7 inline-flex items-center justify-center cut-corner-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-amber/60 ${
                useDeepThinking
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={useDeepThinking ? 'Deep thinking enabled' : 'Enable deep thinking'}
              aria-label={useDeepThinking ? 'Disable deep thinking' : 'Enable deep thinking'}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </button>
          )}
          {context && (
            <button
              type="button"
              onClick={() => setShowContextDetails((prev) => !prev)}
              className={`h-7 w-7 inline-flex items-center justify-center cut-corner-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
                showContextDetails
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={showContextDetails ? 'Hide context snapshot' : 'Show context snapshot'}
              aria-label={showContextDetails ? 'Hide context snapshot' : 'Show context snapshot'}
              aria-pressed={showContextDetails}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 110-16 8 8 0 010 16z"
                />
              </svg>
            </button>
          )}

          {headerActions}

          {/* Collapse Button */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="h-7 w-7 inline-flex items-center justify-center cut-corner-sm text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Minimize chat"
              aria-label="Minimize chat"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-2 py-0.5 border-b border-slate-800/70 panel-rail">
        <div className="flex flex-wrap items-center gap-1 text-[7px] uppercase tracking-[0.18em] text-slate-400">
          <span className={`px-1 py-0.5 cut-corner-sm ${modeAccent}`}>
            Mode: {modeLabel}
          </span>
          {onDeepThinkingChange && (
            <span
              className={`px-1 py-0.5 cut-corner-sm border ${
                useDeepThinking
                  ? 'border-amber-400/60 text-amber-300'
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              Deep: {useDeepThinking ? 'On' : 'Off'}
            </span>
          )}
          {context && (
            <>
              <span
                className="px-1 py-0.5 cut-corner-sm border border-slate-700 text-slate-300"
                title={context.inventorySummary}
              >
                Inv: {context.componentCount}c / {context.connectionCount}w
              </span>
              <span className="px-1 py-0.5 cut-corner-sm border border-slate-700 text-slate-300">
                View: {context.activeView.replace('-', ' ')}
              </span>
              {context.selectedComponentName && (
                <span
                  className="px-1 py-0.5 cut-corner-sm border border-slate-700 text-slate-300 max-w-[140px] truncate"
                  title={context.selectedComponentName}
                >
                  Selected: {context.selectedComponentName}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {context && showContextDetails && (
        <div className="px-2 py-1.5 border-b border-slate-800/70 panel-rail">
          <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-slate-400">
            Context snapshot
            <span className="text-slate-500">live</span>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-slate-200">
            <span className="text-slate-400">Diagram</span>
            <span className="truncate text-slate-200" title={context.currentDiagramTitle || 'Untitled diagram'}>
              {context.currentDiagramTitle || 'Untitled diagram'}
            </span>
            <span className="text-slate-400">Active view</span>
            <span className="text-slate-200">{context.activeView.replace('-', ' ')}</span>
            <span className="text-slate-400">Inventory</span>
            <span className="truncate text-slate-200" title={context.inventorySummary}>
              {context.inventorySummary}
            </span>
            {context.selectedComponentName && (
              <>
                <span className="text-slate-400">Selected</span>
                <span className="truncate text-cyan-200">{context.selectedComponentName}</span>
              </>
            )}
            {context.recentActions.length > 0 && (
              <div className="col-span-2 flex flex-col gap-1 cut-corner-sm border border-slate-800/80 bg-slate-900/60 px-1.5 py-1">
                <span className="text-[7px] uppercase tracking-[0.2em] text-slate-400">
                  Recent actions
                </span>
                <div className="flex flex-wrap gap-1 text-[8px] text-slate-200">
                  {context.recentActions.slice(0, 3).map((action, idx) => (
                    <span
                      key={`${action}-${idx}`}
                      className="px-1 py-0.5 cut-corner-sm border border-slate-700/80 bg-slate-900/70"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {quickActions.length > 0 && (
        <div className="px-2 py-1.5 border-b border-slate-800/70 panel-rail">
          <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Quick actions</span>
              {isQuickActionsPinned && (
                <span className="px-1 py-0.5 text-[7px] tracking-[0.18em] border border-cyan-400/40 text-cyan-300 cut-corner-sm">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleQuickActionsPin}
                className={`h-6 w-6 inline-flex items-center justify-center cut-corner-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
                  isQuickActionsPinned
                    ? 'border-cyan-400/60 text-cyan-200 bg-cyan-500/10'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isQuickActionsPinned ? 'Unpin quick actions' : 'Pin quick actions'}
                aria-label={isQuickActionsPinned ? 'Unpin quick actions' : 'Pin quick actions'}
                aria-pressed={isQuickActionsPinned}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 6h6m-6 0v4l-2 2v1h10v-1l-2-2V6m-3 8v4m0 0l-2 2m2-2l2 2"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleQuickActionsToggle}
                className="h-6 w-6 inline-flex items-center justify-center cut-corner-sm border border-slate-700 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
                title={isQuickActionsOpen ? 'Collapse quick actions' : 'Expand quick actions'}
                aria-label={isQuickActionsOpen ? 'Collapse quick actions' : 'Expand quick actions'}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          {isQuickActionsOpen && (
            <div className="mt-1.5 grid grid-cols-2 lg:grid-cols-3 gap-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => void handleQuickAction(action.prompt)}
                  disabled={isLoading}
                  className={`group control-tile cut-corner-sm flex flex-col gap-1 px-1.5 py-0.5 text-left text-[9px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 disabled:opacity-70 ${action.style}`}
                  title={action.description}
                  aria-label={action.description}
                >
                  <span className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-100">
                    <span className="text-inherit">{action.icon}</span>
                    {action.label}
                  </span>
                  <span className="text-[7px] text-slate-400 group-hover:text-slate-200">
                    {action.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-9 h-9 text-gray-500 mb-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="text-slate-100 font-semibold mb-1.5 tracking-wide text-[12px]">
              CircuitMind Assistant
            </h3>
            <p className="text-slate-400 text-[11px] max-w-[220px]">
              I can see your diagram, inventory, and context. Start with a wiring goal or a parts
              question.
            </p>
            <div className="mt-2 flex flex-col gap-1.5 text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 cut-corner-sm border border-slate-700 bg-slate-900/70">
                Try: “Wire an ESP32 to a DHT11 sensor.”
              </span>
              <span className="px-1.5 py-0.5 cut-corner-sm border border-slate-700 bg-slate-900/70">
                Try: “Show safe pins for this board.”
              </span>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.dateKey}>
              <div className="flex items-center gap-1.5 my-1.5">
                <span className="h-px flex-1 bg-slate-800/80" />
                <span className="text-[7px] uppercase tracking-[0.2em] text-slate-400">
                  {formatGroupLabel(group.dateKey)}
                </span>
                <span className="h-px flex-1 bg-slate-800/80" />
              </div>
              {group.items.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onComponentClick={onComponentClick}
                  onActionClick={onActionClick}
                  isStreaming={msg.isStreaming}
                  onFeedback={handleMessageFeedback}
                />
              ))}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="bg-slate-900 cut-corner-sm px-2 py-1.5 border border-slate-800/70">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="typing-dot w-1 h-1 bg-cyan-400 rounded-full" />
                  <div className="typing-dot w-1 h-1 bg-cyan-400 rounded-full" />
                  <div className="typing-dot w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
                <span className="text-[9px] text-cyan-400 uppercase tracking-widest animate-pulse">
                  {loadingText}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Suggestions */}
      {proactiveSuggestions.length > 0 && (
        <div className="px-2 py-1 border-t border-slate-800/70">
          <div className="flex items-center justify-between mb-1 text-[8px] uppercase tracking-[0.2em] text-slate-400">
            Suggestions
            <span className="text-slate-500">tap to send</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {proactiveSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-1.5 py-0.5 chip-square cut-corner-sm hover:text-white text-slate-300 text-[9px] border border-slate-700 transition-colors"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-2 py-1 border-t border-slate-800">
          <div className="relative inline-block">
            {attachment.type === 'image' ? (
              <img
                src={attachment.base64}
                alt="Attachment"
                className="max-h-14 cut-corner-sm border border-slate-700"
              />
            ) : (
              <video
                src={attachment.base64}
                className="max-h-14 cut-corner-sm border border-slate-700"
              />
            )}
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 h-6 w-6 inline-flex items-center justify-center bg-red-500 text-white cut-corner-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              title="Remove attachment"
              aria-label="Remove attachment"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-400 cut-corner-md flex items-center justify-center z-10">
          <p className="text-cyan-400 font-medium">Drop image or video here</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-1 border-t border-slate-800 panel-rail">
        <div className="flex items-end gap-1">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 w-7 inline-flex items-center justify-center cut-corner-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Attach image or video"
            aria-label="Attach image or video"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Mode Selector */}
          {onModeChange && (
            <div className="flex items-center bg-slate-900 cut-corner-sm p-0.5 border border-slate-700/80">
              {(['chat', 'image', 'video'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onModeChange(mode)}
                  className={`h-7 w-7 inline-flex items-center justify-center text-[9px] cut-corner-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
                    generationMode === mode
                      ? modeAccent
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title={
                    mode === 'chat' ? 'Chat mode' : mode === 'image' ? 'Image mode' : 'Video mode'
                  }
                  aria-label={
                    mode === 'chat' ? 'Chat mode' : mode === 'image' ? 'Image mode' : 'Video mode'
                  }
                >
                  {mode === 'chat' ? '💬' : mode === 'image' ? '🖼️' : '🎬'}
                </button>
              ))}
            </div>
          )}

          {/* Image/Video Generation Controls */}
          {(generationMode === 'image' || generationMode === 'video') && (
            <div className="flex items-center gap-1">
              {/* Aspect Ratio */}
              {onAspectRatioChange && (
                <select
                  value={aspectRatio}
                  onChange={(e) => onAspectRatioChange(e.target.value)}
                  className="h-7 px-1.5 bg-slate-900 border border-slate-700 cut-corner-sm text-[9px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-neon-cyan/60"
                  title="Aspect ratio"
                  aria-label="Aspect ratio"
                >
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="4:3">4:3</option>
                  <option value="3:4">3:4</option>
                </select>
              )}
              {/* Image Size (only for image mode) */}
              {generationMode === 'image' && onImageSizeChange && (
                <select
                  value={imageSize}
                  onChange={(e) => onImageSizeChange(e.target.value as '1K' | '2K' | '4K')}
                  className="h-7 px-1.5 bg-slate-900 border border-slate-700 cut-corner-sm text-[9px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-neon-cyan/60"
                  title="Image resolution"
                  aria-label="Image resolution"
                >
                  <option value="1K">1K</option>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                </select>
              )}
            </div>
          )}

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              generationMode === 'chat'
                ? 'Ask about your circuit...'
                : generationMode === 'image'
                  ? 'Describe the image to generate...'
                  : 'Describe the video to generate...'
            }
            className="flex-1 px-2 py-1 bg-slate-900/70 border border-slate-700 cut-corner-sm text-slate-100 placeholder-slate-400 text-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-neon-cyan/60 focus:border-transparent"
            rows={1}
            style={{ minHeight: '30px', maxHeight: '110px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 110) + 'px';
            }}
          />

          {/* Voice Input Button */}
          {(onStartRecording || onStopRecording) && (
            <button
              type="button"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isLoading}
              className={`h-7 w-7 inline-flex items-center justify-center cut-corner-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                {isRecording ? (
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                )}
              </svg>
            </button>
          )}

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachment) || isLoading}
            className="h-7 w-7 inline-flex items-center justify-center bg-neon-cyan text-black cut-corner-sm transition-colors hover:bg-white disabled:opacity-80 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 shadow-[0_0_12px_rgba(0,243,255,0.35)]"
            title="Send message"
            aria-label="Send message"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
