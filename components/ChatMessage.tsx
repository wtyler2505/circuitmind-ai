/**
 * ChatMessage Component
 *
 * Renders a single chat message with rich features:
 * - Clickable component mentions (chips)
 * - Action buttons for suggested actions
 * - Executed action indicators
 * - Code blocks with syntax highlighting
 * - Grounding source links
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { EnhancedChatMessage, ActionIntent } from '../types';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  onComponentClick?: (componentId: string) => void;
  onActionClick?: (action: ActionIntent) => void;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onComponentClick,
  onActionClick,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const renderMarkdown = () => {
    if (!message.content) return null;

    return (
      <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mt-4 mb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-white mt-3 mb-1">{children}</h3>
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
              <pre className="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto">{children}</pre>
            ),
            code: ({ children, ...props }) => {
              // Check if this is an inline code (no className means inline)
              const isInline = !props.className;
              if (isInline) {
                return (
                  <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-300 text-sm">
                    {children}
                  </code>
                );
              }
              return <code className="text-xs text-green-300">{children}</code>;
            },
            p: ({ children }) => <p className="text-gray-200 leading-relaxed">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  // Render component mention chips
  const renderComponentChips = () => {
    if (!message.linkedComponents || message.linkedComponents.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {message.linkedComponents.map((comp, idx) => (
          <button
            key={`${comp.componentId}-${idx}`}
            onClick={() => onComponentClick?.(comp.componentId)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs hover:bg-cyan-500/30 transition-colors"
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
      <div className="flex flex-wrap gap-2 mt-3">
        {message.suggestedActions.map((action, idx) => (
          <button
            key={`${action.type}-${idx}`}
            onClick={() => onActionClick?.(action)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              action.safe
                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
            }`}
          >
            {getActionIcon(action.type)}
            {action.label}
            {action.safe && <span className="text-[10px] opacity-60">auto</span>}
          </button>
        ))}
      </div>
    );
  };

  // Render executed actions
  const renderExecutedActions = () => {
    if (!message.executedActions || message.executedActions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {message.executedActions.map((exec, idx) => (
          <span
            key={`exec-${idx}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
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
      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-[10px] text-gray-300 mb-1.5">Sources:</p>
        <div className="flex flex-wrap gap-1.5">
          {message.groundingSources.slice(0, 3).map((source, idx) => (
            <a
              key={idx}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] hover:text-cyan-300 hover:bg-gray-700 transition-colors truncate max-w-[200px]"
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
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
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
          <span className="text-sm font-medium text-white">{diagram.title}</span>
        </div>
        <p className="text-xs text-gray-300 mb-2">
          {diagram.components.length} components · {diagram.connections.length} connections
        </p>
        <p className="text-xs text-gray-300 line-clamp-2">{diagram.explanation}</p>
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
            className="max-w-full max-h-64 rounded-lg border border-gray-700"
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
            className="max-w-full max-h-64 rounded-lg border border-gray-700"
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
        <div className="px-3 py-1.5 bg-gray-800/50 text-gray-300 text-xs rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-200 rounded-bl-md'
        }`}
      >
        {/* Message content */}
        {renderMarkdown()}

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

        {/* Timestamp */}
        <div className={`text-[10px] mt-2 ${isUser ? 'text-blue-200/70' : 'text-gray-300'}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionIcon(type: string): React.ReactNode {
  switch (type) {
    case 'highlight':
    case 'highlightWire':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      );
    case 'centerOn':
    case 'zoomTo':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    case 'openInventory':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
    case 'addComponent':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      );
    case 'createConnection':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
  }
}

export default React.memo(ChatMessage);
