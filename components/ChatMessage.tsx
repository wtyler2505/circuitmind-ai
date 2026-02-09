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

interface ChatMessageProps {
  message: EnhancedChatMessage;
  onComponentClick?: (componentId: string) => void;
  onActionClick?: (action: ActionIntent) => void;
  isStreaming?: boolean;
  onFeedback?: (messageId: string, score: number) => void;
}

// --- Markdown component overrides (stable reference) ---

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold text-white mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h3>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-gray-300">{children}</em>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-300 underline hover:text-cyan-200"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-gray-200">{children}</li>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-gray-900 cut-corner-sm border border-gray-700/80 p-2 my-2 overflow-x-auto">
      {children}
    </pre>
  ),
  code: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => {
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
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-gray-200 leading-[1.55]">{children}</p>
  ),
};

// --- Sub-components ---

const MarkdownContent: React.FC<{ content: string }> = React.memo(({ content }) => (
  <div className="text-[12px] leading-[1.55] prose prose-invert prose-sm max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={markdownComponents as React.ComponentProps<typeof ReactMarkdown>['components']}
    >
      {content}
    </ReactMarkdown>
  </div>
));
MarkdownContent.displayName = 'MarkdownContent';

const ComponentChips: React.FC<{
  linkedComponents: NonNullable<EnhancedChatMessage['linkedComponents']>;
  onComponentClick?: (componentId: string) => void;
}> = ({ linkedComponents, onComponentClick }) => (
  <div className="flex flex-wrap gap-1 mt-2">
    {linkedComponents.map((comp, idx) => (
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

const ActionButtons: React.FC<{
  suggestedActions: ActionIntent[];
  onActionClick?: (action: ActionIntent) => void;
}> = ({ suggestedActions, onActionClick }) => (
  <div className="flex flex-wrap gap-1.5 mt-2.5">
    {suggestedActions.map((action, idx) => (
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

const ExecutedActions: React.FC<{
  executedActions: NonNullable<EnhancedChatMessage['executedActions']>;
}> = ({ executedActions }) => (
  <div className="flex flex-wrap gap-1 mt-2">
    {executedActions.map((exec, idx) => (
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

const SourceLinks: React.FC<{
  groundingSources: NonNullable<EnhancedChatMessage['groundingSources']>;
}> = ({ groundingSources }) => (
  <div className="mt-3 pt-2 border-t border-gray-700/80">
    <p className="text-[9px] text-gray-300 mb-1.5 uppercase tracking-[0.18em]">Sources</p>
    <div className="flex flex-wrap gap-1">
      {groundingSources.slice(0, 3).map((source, idx) => (
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

const DiagramPreview: React.FC<{
  diagramData: NonNullable<EnhancedChatMessage['diagramData']>;
}> = ({ diagramData }) => (
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
      <span className="text-[12px] font-medium text-white">{diagramData.title}</span>
    </div>
    <p className="text-[10px] text-gray-300 mb-1.5">
      {diagramData.components.length} components · {diagramData.connections.length} connections
    </p>
    <p className="text-[10px] text-gray-300 line-clamp-2">{diagramData.explanation}</p>
  </div>
);

const MediaAttachment: React.FC<{
  image?: string;
  video?: string;
}> = ({ image, video }) => {
  if (image) {
    return (
      <div className="mt-2">
        <img
          src={`data:image/png;base64,${image}`}
          alt="Attached"
          className="max-w-full max-h-64 cut-corner-sm border border-gray-700"
        />
      </div>
    );
  }
  if (video) {
    return (
      <div className="mt-2">
        <video
          src={video}
          controls
          className="max-w-full max-h-64 cut-corner-sm border border-gray-700"
        />
      </div>
    );
  }
  return null;
};

const StreamingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5 mt-2">
    <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
    <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
    <div className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full" />
  </div>
);

const MessageFeedback: React.FC<{
  messageId: string;
  isUser: boolean;
  isSystem: boolean;
  timestamp: number;
  onFeedback?: (messageId: string, score: number) => void;
}> = ({ messageId, isUser, isSystem, timestamp, onFeedback }) => {
  const [feedbackGiven, setFeedbackGiven] = React.useState<number | null>(null);

  const handleFeedback = (score: number) => {
    setFeedbackGiven(score);
    onFeedback?.(messageId, score);
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <div className={`text-[9px] ${isUser ? 'text-blue-200/70' : 'text-gray-300'}`}>
        {formatTimestamp(timestamp)}
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
  );
};

// --- Main Component ---

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onComponentClick,
  onActionClick,
  isStreaming = false,
  onFeedback,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

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
        {message.content && <MarkdownContent content={message.content} />}

        {/* Media attachments */}
        <MediaAttachment image={message.image} video={message.video} />

        {/* Diagram preview */}
        {message.diagramData && <DiagramPreview diagramData={message.diagramData} />}

        {/* Component mentions */}
        {!isUser && message.linkedComponents && message.linkedComponents.length > 0 && (
          <ComponentChips
            linkedComponents={message.linkedComponents}
            onComponentClick={onComponentClick}
          />
        )}

        {/* Suggested actions */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <ActionButtons
            suggestedActions={message.suggestedActions}
            onActionClick={onActionClick}
          />
        )}

        {/* Executed actions */}
        {!isUser && message.executedActions && message.executedActions.length > 0 && (
          <ExecutedActions executedActions={message.executedActions} />
        )}

        {/* Streaming indicator */}
        {isStreaming && <StreamingIndicator />}

        {/* Grounding sources */}
        {!isUser && message.groundingSources && message.groundingSources.length > 0 && (
          <SourceLinks groundingSources={message.groundingSources} />
        )}

        {/* Timestamp & Feedback */}
        <MessageFeedback
          messageId={message.id}
          isUser={isUser}
          isSystem={isSystem}
          timestamp={message.timestamp}
          onFeedback={onFeedback}
        />
      </div>
    </div>
  );
};

// --- Helper functions ---

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

export default React.memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.message.executedActions?.length === nextProps.message.executedActions?.length
  );
});
