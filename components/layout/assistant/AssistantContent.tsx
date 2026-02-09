import React, { memo } from 'react';
import ChatPanel from '../../ChatPanel';
import { BootcampPanel } from '../BootcampPanel';
import { ProjectTimeline } from '../ProjectTimeline';
import { DebugWorkbench } from '../DebugWorkbench';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { SystemLogViewer } from '../SystemLogViewer';
import ErrorBoundary from '../../ErrorBoundary';
import { AssistantTabs, type AssistantTabType } from './AssistantTabs';
import type { UseConversationsReturn } from '../../../hooks/useConversations';
import type { ActionIntent, AIContext } from '../../../types';

type GenerationMode = 'chat' | 'image' | 'video';
type ImageSize = '1K' | '2K' | '4K';

interface AssistantContentProps {
  assistantTab: AssistantTabType;
  onTabChange: (tab: AssistantTabType) => void;
  conversationManager: UseConversationsReturn;
  onSendMessage: (
    content: string,
    attachment?: { base64: string; type: 'image' | 'video' | 'document'; name?: string }
  ) => Promise<void>;
  isLoading: boolean;
  loadingText: string;
  onComponentClick: (componentId: string) => void;
  onActionClick: (action: ActionIntent) => Promise<{ success: boolean; error?: string }>;
  context: AIContext | null;
  proactiveSuggestions: string[];
  generationMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  useDeepThinking: boolean;
  onDeepThinkingChange: (enabled: boolean) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
}

const AssistantContentComponent: React.FC<AssistantContentProps> = ({
  assistantTab,
  onTabChange,
  conversationManager,
  onSendMessage,
  isLoading,
  loadingText,
  onComponentClick,
  onActionClick,
  context,
  proactiveSuggestions,
  generationMode,
  onModeChange,
  useDeepThinking,
  onDeepThinkingChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  imageSize,
  onImageSizeChange,
  aspectRatio,
  onAspectRatioChange,
  isExpanded,
  onToggleExpand,
  isPinned,
  onTogglePin,
  onClose,
}) => (
  <ErrorBoundary>
    <div className="flex flex-col h-full overflow-hidden">
      <AssistantTabs activeTab={assistantTab} onTabChange={onTabChange} />

      <div className="flex-1 overflow-hidden">
        {assistantTab === 'chat' ? (
          <ChatPanel
            conversations={conversationManager.conversations}
            activeConversationId={conversationManager.activeConversationId}
            messages={conversationManager.messages}
            onSwitchConversation={conversationManager.switchConversation}
            onCreateConversation={conversationManager.createConversation}
            onDeleteConversation={conversationManager.deleteConversation}
            onRenameConversation={conversationManager.renameConversation}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            loadingText={loadingText}
            onComponentClick={onComponentClick}
            onActionClick={(action) => onActionClick(action)}
            context={context || undefined}
            proactiveSuggestions={proactiveSuggestions}
            onSuggestionClick={(s) => onSendMessage(s)}
            generationMode={generationMode}
            onModeChange={onModeChange}
            useDeepThinking={useDeepThinking}
            onDeepThinkingChange={onDeepThinkingChange}
            isRecording={isRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            imageSize={imageSize}
            onImageSizeChange={onImageSizeChange}
            aspectRatio={aspectRatio}
            onAspectRatioChange={onAspectRatioChange}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            className="h-full border-none rounded-none"
            headerActions={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onTogglePin}
                  className={`h-10 w-10 inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${isPinned ? 'text-neon-green' : 'text-slate-400 hover:text-neon-cyan'}`}
                  aria-label={isPinned ? 'Unpin assistant sidebar' : 'Pin assistant sidebar'}
                  title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {isPinned ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 11V7a4 4 0 118 0v6a3 3 0 01-3 3H6a2 2 0 01-2-2v-6a3 3 0 013-3zM8 16v2M12 16v2M16 16v2"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 w-10 inline-flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
                  aria-label="Close assistant sidebar"
                  title="Close assistant"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 6L6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            }
          />
        ) : assistantTab === 'bootcamp' ? (
          <BootcampPanel />
        ) : assistantTab === 'history' ? (
          <ProjectTimeline />
        ) : assistantTab === 'diagnostic' ? (
          <DebugWorkbench />
        ) : assistantTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <SystemLogViewer />
        )}
      </div>
    </div>
  </ErrorBoundary>
);

export const AssistantContent = memo(AssistantContentComponent);
