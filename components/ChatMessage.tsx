/**
 * ChatMessage Component
 *
 * Renders a single chat message with rich features:
 * - Clickable component mentions (chips)
 * - Action buttons for suggested actions
 * - Executed action indicators
 * - Code blocks with syntax highlighting
 * - Grounding source links
 * - Feedback UI (Thumbs Up/Down)
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { EnhancedChatMessage, ActionIntent } from '../types';
import { formatTimestamp, getActionIcon } from './chat/chatMessageUtils';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  onComponentClick?: (componentId: string) => void;
  onActionClick?: (action: ActionIntent) => void;
  isStreaming?: boolean;
  onFeedback?: (messageId: string, score: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onComponentClick,
  onActionClick,
  isStreaming = false,
  onFeedback,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [feedbackGiven, setFeedbackGiven] = React.useState<number | null>(null);

  const handleFeedback = (score: number) => {
    setFeedbackGiven(score);
    if (onFeedback) {
      onFeedback(message.id, score);
    }
  };

  const renderedMarkdown = React.useMemo(() => {
    if (!message.content) return null;

    return (
      <div className="text-[12px] leading-[1.55] prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-semibold text-white mt-3 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h3>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="text-gray-300">{children}</em>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline hover:text-cyan-200"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="text-gray-200">{children}</li>,
            pre: ({ children }) => (
              <pre className="bg-gray-900 cut-corner-sm border border-gray-700/80 p-2 my-2 overflow-x-auto">
                {children}
              </pre>
            ),
            code: ({ children, ...props }) => {
              const isInline = !props.className;
              if (isInline) {
                return (
                  <code className="bg-gray-800 px-1.5 py-0.5 cut-corner-sm text-cyan-300 text-[11px]">
                    {children}
                  </code>
                );
              }
              return <code className="text-xs text-green-300">{children}</code>;
            },
            p: ({ children }) => <p className="text-gray-200 leading-[1.55]">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  }, [message.content]);

  // Render component mention chips
  const renderComponentChips = () => {
    if (!message.linkedComponents || message.linkedComponents.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {message.linkedComponents.map((comp, idx) => (
          <button
            key={`${comp.componentId}-${idx}`}
            onClick={() => onComponentClick?.(comp.componentId)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 chip-square cut-corner-sm text-cyan-300 text-[10px] hover:text-cyan-200 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            {comp.componentName}
          </button>
        ))}
      </div>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    if (!message.suggestedActions || message.suggestedActions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {message.suggestedActions.map((action, idx) => (
          <button
            key={`${action.type}-${idx}`}
            onClick={() => onActionClick?.(action)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 cut-corner-sm text-[10px] font-medium transition-all ${
              action.safe
                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
            }`}
          >
            {getActionIcon(action.type)}
            {action.label}
            {action.safe && <span className="text-[9px] opacity-60">auto</span>}
          </button>
        ))}
      </div>
    );
  };

  // Render executed actions
  const renderExecutedActions = () => {
    if (!message.executedActions || message.executedActions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {message.executedActions.map((exec, idx) => (
          <span
            key={`exec-${idx}`}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 cut-corner-sm text-[9px] ${
              exec.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}
          >
            {exec.success ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {exec.type}
            {exec.auto && <span className="opacity-60">(auto)</span>}
          </span>
        ))}
      </div>
    );
  };

  // Render grounding sources
  const renderSources = () => {
    if (!message.groundingSources || message.groundingSources.length === 0) return null;

    return (
      <div className="mt-3 pt-2 border-t border-gray-700/80">
        <p className="text-[9px] text-gray-300 mb-1.5 uppercase tracking-[0.18em]">Sources</p>
        <div className="flex flex-wrap gap-1">
          {message.groundingSources.slice(0, 3).map((source, idx) => (
            <a
              key={idx}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 chip-square cut-corner-sm text-gray-300 text-[9px] hover:text-cyan-300 transition-colors truncate max-w-[200px]"
              title={source.title || 'Source'}
            >
              <svg
                className="w-2.5 h-2.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {source.title || 'Source'}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Render diagram preview
  const renderDiagramPreview = () => {
    if (!message.diagramData) return null;

    const diagram = message.diagramData;

    return (
      <div className="mt-3 p-2 bg-gray-800/50 cut-corner-sm border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
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
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <span className="text-[12px] font-medium text-white">{diagram.title}</span>
        </div>
        <p className="text-[10px] text-gray-300 mb-1.5">
          {diagram.components.length} components · {diagram.connections.length} connections
        </p>
        <p className="text-[10px] text-gray-300 line-clamp-2">{diagram.explanation}</p>
      </div>
    );
  };

  // Render image/video attachments
  const renderMedia = () => {
    if (message.image) {
      return (
        <div className="mt-2">
          <img
            src={`data:image/png;base64,${message.image}`}
            alt="Attached"
            className="max-w-full max-h-64 cut-corner-sm border border-gray-700"
          />
        </div>
      );
    }
    if (message.video) {
      return (
        <div className="mt-2">
          <video
            src={message.video}
            controls
            className="max-w-full max-h-64 cut-corner-sm border border-gray-700"
          />
        </div>
      );
    }
    return null;
  };

  // Streaming indicator
  const renderStreamingIndicator = () => {
    if (!isStreaming) return null;

    return (
      <div className="flex items-center gap-1.5 mt-2">
        <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
      </div>
    );
  };

  // System message styling
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-2.5 py-1 bg-gray-800/50 text-gray-300 text-[10px] cut-corner-sm border border-gray-700/70">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div
        className={`max-w-[86%] message-slab cut-corner-sm px-3 py-2 ${
          isUser ? 'message-user' : 'message-assistant'
        }`}
      >
        {/* Message content */}
        {renderedMarkdown}

        {/* Media attachments */}
        {renderMedia()}

        {/* Diagram preview */}
        {renderDiagramPreview()}

        {/* Component mentions */}
        {!isUser && renderComponentChips()}

        {/* Suggested actions */}
        {!isUser && renderActionButtons()}

        {/* Executed actions */}
        {!isUser && renderExecutedActions()}

        {/* Streaming indicator */}
        {renderStreamingIndicator()}

        {/* Grounding sources */}
        {!isUser && renderSources()}

        {/* Timestamp & Feedback */}
        <div className="flex items-center justify-between mt-2">
            <div className={`text-[9px] ${isUser ? 'text-blue-200/70' : 'text-gray-300'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
            {!isUser && !isSystem && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => handleFeedback(1)} 
                        className={`p-1 hover:text-green-400 ${feedbackGiven === 1 ? 'text-green-400' : 'text-gray-500'}`}
                        title="Helpful"
                        aria-label="Helpful"
                    >
                        👍
                    </button>
                    <button 
                        onClick={() => handleFeedback(-1)} 
                        className={`p-1 hover:text-red-400 ${feedbackGiven === -1 ? 'text-red-400' : 'text-gray-500'}`}
                        title="Not helpful"
                        aria-label="Not helpful"
                    >
                        👎
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.message.executedActions?.length === nextProps.message.executedActions?.length
  );
});