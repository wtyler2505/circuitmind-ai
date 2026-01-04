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

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EnhancedChatMessage, ActionIntent, Conversation, AIContext } from '../types';
import ChatMessage from './ChatMessage';
import ConversationSwitcher from './ConversationSwitcher';
import { aiMetricsService } from '../services/aiMetricsService';
import IconButton from './IconButton';

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
    attachment?: { base64: string; type: 'image' | 'video' | 'document'; name?: string }
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

const QUICK_ACTIONS = [
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
  const [attachment, setAttachment] = useState<{ base64: string; type: 'image' | 'video' | 'document'; name?: string } | null>(
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
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() && !attachment) return;

    const content = inputValue.trim();
    setInputValue('');
    const attachmentToSend = attachment;
    setAttachment(null);

    await onSendMessage(content, attachmentToSend || undefined);
  }, [inputValue, attachment, onSendMessage]);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      let type: 'image' | 'video' | 'document' = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      if (file.type === 'application/pdf') type = 'document';
      
      setAttachment({ base64, type, name: file.name });
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let type: 'image' | 'video' | 'document' = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        if (file.type === 'application/pdf') type = 'document';
        
        setAttachment({ base64, type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback(() => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleQuickActionsToggle = useCallback(() => {
    setIsQuickActionsOpen((prev) => {
      if (prev && isQuickActionsPinned) {
        setIsQuickActionsPinned(false);
      }
      return !prev;
    });
  }, [isQuickActionsPinned]);

  const handleQuickActionsPin = useCallback(() => {
    setIsQuickActionsPinned((prev) => {
      const next = !prev;
      if (next) {
        setIsQuickActionsOpen(true);
      }
      return next;
    });
  }, []);

  const handleMessageFeedback = useCallback((messageId: string, score: number) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg?.metricId) {
      aiMetricsService.recordFeedback(msg.metricId, score);
    }
  }, [messages]);

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

  // Updated container class for darker industrial look
  const containerClassName = useMemo(() => 
    `relative flex flex-col h-full bg-[#020203] panel-frame border-l border-slate-800/80 ${className}`.trim(),
    [className]
  );

  const handleQuickAction = useCallback(async (prompt: string) => {
    if (isLoading) return;
    if (onSuggestionClick) {
      onSuggestionClick(prompt);
      return;
    }
    await onSendMessage(prompt);
  }, [isLoading, onSuggestionClick, onSendMessage]);

  const groupedMessages = useMemo(() => messages.reduce(
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
  ), [messages]);

  const formatGroupLabel = useCallback((dateKey: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const date = new Date(dateKey);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  return (
    <div
      className={containerClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#050608] shrink-0">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold panel-title">
            <span>Assistant</span>
            <span className="h-1.5 w-1.5 bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.65)]" />
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
            <div className="hidden xl:flex items-center gap-1.5 px-1.5 py-0.5 cut-corner-sm text-[8px] text-slate-400 border border-white/5 bg-white/5">
              {context.currentDiagramTitle && (
                <span className="flex items-center gap-1">
                  <span className="text-neon-cyan/70">PROJ</span>
                  {context.componentCount}c
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCreateConversation}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-[0.1em] cut-corner-sm border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-neon-cyan/40 transition-colors"
            title="Start a new conversation"
            aria-label="Create new conversation"
          >
            <span className="text-neon-cyan font-bold">+</span>
            New
          </button>
          {/* Deep Thinking Toggle */}
          {onDeepThinkingChange && (
            <IconButton
              onClick={() => onDeepThinkingChange(!useDeepThinking)}
              label={useDeepThinking ? 'Disable deep thinking' : 'Enable deep thinking'}
              size="sm"
              variant={useDeepThinking ? 'primary' : 'ghost'}
              className={useDeepThinking ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-500'}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              }
            />
          )}
          {context && (
            <IconButton
              onClick={() => setShowContextDetails((prev) => !prev)}
              label={showContextDetails ? 'Hide context snapshot' : 'Show context snapshot'}
              size="sm"
              variant={showContextDetails ? 'primary' : 'ghost'}
              className={showContextDetails ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'text-slate-500'}
              aria-pressed={showContextDetails}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 110-16 8 8 0 010 16z"
                  />
                </svg>
              }
            />
          )}

          {headerActions}

          {/* Collapse Button */}
          {onToggleExpand && (
            <IconButton
              onClick={onToggleExpand}
              label="Minimize chat"
              size="sm"
              variant="ghost"
              className="text-slate-500 hover:text-white"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              }
            />
          )}
        </div>
      </div>

      <div className="px-3 py-1 border-b border-white/5 bg-[#08090c]">
        <div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <span>MODE:</span>
            <span className={`text-slate-300 ${generationMode !== 'chat' ? 'text-neon-amber' : ''}`}>
              {generationMode}
            </span>
          </div>
          {onDeepThinkingChange && (
            <div className="flex items-center gap-1">
              <span>DEEP:</span>
              <span className={useDeepThinking ? 'text-neon-amber' : 'text-slate-600'}>
                {useDeepThinking ? 'ON' : 'OFF'}
              </span>
            </div>
          )}
          {context && (
            <div className="flex items-center gap-1">
              <span>VIEW:</span>
              <span className="text-slate-300">{context.activeView.replace('-', ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {context && showContextDetails && (
        <div className="px-3 py-2 border-b border-white/5 bg-[#0a0c10]">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-2">
            Context Snapshot
            <span className="text-neon-green">LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono">
            <span className="text-slate-600">PROJECT:</span>
            <span className="text-slate-300 truncate" title={context.currentDiagramTitle || 'Untitled'}>
              {context.currentDiagramTitle || 'Untitled'}
            </span>
            <span className="text-slate-600">INVENTORY:</span>
            <span className="text-slate-300 truncate" title={context.inventorySummary}>
              {context.inventorySummary}
            </span>
            <span className="text-slate-600">SELECTED:</span>
            <span 
              className={`truncate ${context.selectedComponentName ? 'text-neon-cyan' : 'text-slate-600'}`}
              title={context.selectedComponentName || 'None'}
            >
              {context.selectedComponentName || 'None'}
            </span>
          </div>
        </div>
      )}

      {QUICK_ACTIONS.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5 bg-[#050608]">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <span>Quick Actions</span>
              {isQuickActionsPinned && (
                <span className="text-[8px] text-neon-cyan border border-neon-cyan/30 px-1 cut-corner-sm">
                  PINNED
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IconButton
                onClick={handleQuickActionsPin}
                label="Pin actions"
                size="sm"
                variant={isQuickActionsPinned ? 'primary' : 'ghost'}
                className={isQuickActionsPinned ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5' : 'text-slate-600'}
                icon={
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                }
              />
              <IconButton
                onClick={handleQuickActionsToggle}
                label="Toggle actions"
                size="sm"
                variant="ghost"
                className="text-slate-600 hover:text-slate-300"
                icon={
                  <svg
                    className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
              />
            </div>
          </div>
          {isQuickActionsOpen && (
            <div className="grid grid-cols-2 gap-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => void handleQuickAction(action.prompt)}
                  disabled={isLoading}
                  className={`group bg-[#0f1218] border border-white/5 hover:border-white/20 cut-corner-sm p-2 text-left transition-all ${action.style.replace('border-left', 'border-l-2')}`}
                  title={action.description}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 group-hover:text-white mb-0.5">
                    <span className="text-slate-500 group-hover:text-inherit transition-colors">{action.icon}</span>
                    {action.label}
                  </div>
                  <div className="text-[8px] text-slate-600 group-hover:text-slate-400 truncate">
                    {action.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar bg-[#020203]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="w-12 h-12 border border-slate-700 bg-slate-900/50 flex items-center justify-center mb-3 cut-corner-md">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-slate-300 font-bold mb-1 tracking-widest text-[10px] uppercase">
              System Ready
            </h3>
            <p className="text-slate-500 text-[10px] max-w-[200px] leading-relaxed">
              Awaiting command. I can analyze circuits, generate code, or draft wiring plans.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.dateKey} className="mb-4">
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-600 font-mono">
                  {formatGroupLabel(group.dateKey)}
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div className="space-y-3">
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
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4 px-2 animate-pulse">
            <div className="flex items-center gap-2 text-[10px] text-neon-cyan uppercase tracking-widest font-mono">
              <span className="w-2 h-2 bg-neon-cyan/50" />
              {loadingText}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Suggestions */}
      {proactiveSuggestions.length > 0 && (
        <div className="px-3 py-2 border-t border-white/5 bg-[#050608]">
          <div className="flex flex-wrap gap-2">
            {proactiveSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-2 py-1 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-[9px] text-slate-300 hover:text-white transition-colors cut-corner-sm flex items-center gap-1.5"
              >
                <span className="text-neon-purple text-[10px]">›</span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-3 py-2 border-t border-white/5 bg-[#0a0c10]">
          <div className="relative inline-block group">
            <div className="cut-corner-sm overflow-hidden border border-slate-600 bg-slate-900">
              {attachment.type === 'image' ? (
                <img src={attachment.base64} alt="Attachment" className="max-h-16 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : attachment.type === 'video' ? (
                <video src={attachment.base64} className="max-h-16" />
              ) : (
                <div className="flex items-center gap-2 p-2 h-16 min-w-[120px]">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] text-slate-300 truncate max-w-[100px]">{attachment.name || 'Document'}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-red-500 text-black font-bold hover:bg-white cut-corner-sm shadow-md"
              title="Remove"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border-2 border-dashed border-neon-cyan flex flex-col items-center justify-center z-50">
          <svg className="w-12 h-12 text-neon-cyan mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-neon-cyan font-bold tracking-widest text-xs uppercase">Drop File to Upload</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-white/5 bg-[#050608]">
        <div className="relative bg-black border border-slate-700 focus-within:border-neon-cyan/50 transition-colors cut-corner-md">
          {/* Top Controls inside Input Box */}
          <div className="flex items-center justify-between px-2 pt-1.5 pb-1 border-b border-white/5">
            <div className="flex gap-1">
              {(['chat', 'image', 'video'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onModeChange?.(mode)}
                  className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider transition-colors ${
                    generationMode === mode
                      ? mode === 'chat' ? 'text-neon-cyan bg-neon-cyan/10' : mode === 'image' ? 'text-neon-amber bg-neon-amber/10' : 'text-neon-purple bg-neon-purple/10'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                label="Attach File"
                size="sm"
                variant="ghost"
                className="text-slate-500 hover:text-white"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                }
              />
              {(onStartRecording || onStopRecording) && (
                <IconButton
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  label={isRecording ? 'Stop recording' : 'Voice Input'}
                  size="sm"
                  variant={isRecording ? 'danger' : 'ghost'}
                  className={isRecording ? 'animate-pulse' : 'text-slate-500 hover:text-white'}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      {isRecording ? (
                        <rect x="6" y="6" width="12" height="12" />
                      ) : (
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      )}
                    </svg>
                  }
                />
              )}
            </div>
          </div>

          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              generationMode === 'chat' ? 'ENTER COMMAND...' :
              generationMode === 'image' ? 'IMAGE PROMPT...' : 'VIDEO PROMPT...'
            }
            className="w-full bg-transparent px-3 py-2 text-[11px] text-white font-mono placeholder-slate-600 focus:outline-none resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />

          <div className="absolute bottom-2 right-2">
            <IconButton
              onClick={handleSend}
              label="Send message"
              disabled={(!inputValue.trim() && !attachment) || isLoading}
              size="sm"
              variant="ghost"
              className="bg-slate-800 text-slate-400 hover:bg-neon-cyan hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              icon={
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            />
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default React.memo(ChatPanel);