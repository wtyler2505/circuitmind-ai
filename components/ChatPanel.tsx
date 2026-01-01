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
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<{ base64: string; type: 'image' | 'video' } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpand}
        className="fixed bottom-4 right-4 h-11 w-11 inline-flex items-center justify-center bg-neon-cyan text-black rounded-full shadow-[0_0_18px_rgba(0,243,255,0.45)] transition-all z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 hover:bg-white"
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
  const containerClassName = `relative flex flex-col h-full bg-slate-950/80 rounded-t-xl border border-slate-800/80 border-b-0 ${className}`.trim();

  return (
    <div
      className={containerClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/70 rounded-t-xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <span>AI Assistant</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.65)]" />
          </div>
          <div className="flex items-center gap-3">
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
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700/70 bg-slate-900/70">
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
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateConversation}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.2em] rounded-lg border border-slate-700 bg-slate-900/70 text-slate-300 hover:text-white hover:border-neon-cyan/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
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
              className={`h-11 w-11 inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-amber/60 ${
                useDeepThinking
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={useDeepThinking ? 'Deep thinking enabled' : 'Enable deep thinking'}
              aria-label={useDeepThinking ? 'Disable deep thinking' : 'Enable deep thinking'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
              className="h-11 w-11 inline-flex items-center justify-center text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Minimize chat"
              aria-label="Minimize chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="px-4 py-2 border-b border-slate-800/70 bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span className={`px-2 py-1 rounded-full ${modeAccent}`}>
            Mode: {modeLabel}
          </span>
          {onDeepThinkingChange && (
            <span
              className={`px-2 py-1 rounded-full border ${
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
                className="px-2 py-1 rounded-full border border-slate-700 text-slate-300"
                title={context.inventorySummary}
              >
                Inv: {context.componentCount}c / {context.connectionCount}w
              </span>
              <span className="px-2 py-1 rounded-full border border-slate-700 text-slate-300">
                View: {context.activeView.replace('-', ' ')}
              </span>
              {context.selectedComponentName && (
                <span
                  className="px-2 py-1 rounded-full border border-slate-700 text-slate-300 max-w-[180px] truncate"
                  title={context.selectedComponentName}
                >
                  Selected: {context.selectedComponentName}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-12 h-12 text-gray-500 mb-3"
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
            <h3 className="text-slate-100 font-semibold mb-2 tracking-wide">CircuitMind Assistant</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              I can see your diagram, inventory, and context. Start with a wiring goal or a parts
              question.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/70">
                Try: “Wire an ESP32 to a DHT11 sensor.”
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/70">
                Try: “Show safe pins for this board.”
              </span>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onComponentClick={onComponentClick}
              onActionClick={onActionClick}
              isStreaming={msg.isStreaming}
            />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-slate-900 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-800/70">
              <div className="flex items-center gap-1.5">
                <div className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Suggestions */}
      {proactiveSuggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800/70">
          <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Suggestions
            <span className="text-slate-500">tap to send</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {proactiveSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 border-t border-slate-800">
          <div className="relative inline-block">
            {attachment.type === 'image' ? (
              <img
                src={attachment.base64}
                alt="Attachment"
                className="max-h-20 rounded-lg border border-slate-700"
              />
            ) : (
              <video
                src={attachment.base64}
                className="max-h-20 rounded-lg border border-slate-700"
              />
            )}
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 h-11 w-11 inline-flex items-center justify-center bg-red-500 text-white rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              title="Remove attachment"
              aria-label="Remove attachment"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-400 rounded-xl flex items-center justify-center z-10">
          <p className="text-cyan-400 font-medium">Drop image or video here</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 inline-flex items-center justify-center text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Attach image or video"
            aria-label="Attach image or video"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700/80">
              {(['chat', 'image', 'video'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onModeChange(mode)}
                  className={`h-11 w-11 inline-flex items-center justify-center text-xs rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
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
            className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neon-cyan/60 focus:border-transparent"
            rows={1}
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachment) || isLoading}
            className="h-11 w-11 inline-flex items-center justify-center bg-neon-cyan text-black rounded-xl transition-colors hover:bg-white disabled:opacity-80 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 shadow-[0_0_12px_rgba(0,243,255,0.35)]"
            title="Send message"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
