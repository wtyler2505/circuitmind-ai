import React, { memo, useState } from 'react';
import type { ElectronicComponent } from '../../types';

interface SyncStatusBadgeProps {
  status?: ElectronicComponent['syncStatus'];
  provenance?: ElectronicComponent['provenance'];
  size?: 'sm' | 'md';
}

interface StatusConfig {
  color: string;
  glow: string;
  label: string;
  icon: React.ReactNode;
}

const dotClass = (size: 'sm' | 'md') =>
  size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

function getConfig(
  status: ElectronicComponent['syncStatus'] | undefined,
  provenance: ElectronicComponent['provenance'] | undefined,
  size: 'sm' | 'md'
): StatusConfig {
  const sz = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  switch (status) {
    case 'synced':
      return {
        color: 'text-neon-green',
        glow: 'drop-shadow-[0_0_3px_rgba(0,255,136,0.5)]',
        label: 'Synced with backend',
        icon: (
          <svg className={sz} viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };

    case 'local_modified':
      return {
        color: 'text-amber-400',
        glow: 'drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]',
        label: 'Modified locally — not yet synced',
        icon: (
          <svg className={sz} viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="4" />
          </svg>
        ),
      };

    case 'conflict':
      return {
        color: 'text-red-400',
        glow: 'drop-shadow-[0_0_3px_rgba(248,113,113,0.6)]',
        label: 'Sync conflict — local and server differ',
        icon: (
          <svg className={sz} viewBox="0 0 12 12" fill="none">
            <path
              d="M6 3v4m0 2h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      };

    case 'pending_upload':
      return {
        color: 'text-neon-cyan',
        glow: 'drop-shadow-[0_0_3px_rgba(0,255,255,0.5)]',
        label:
          provenance === 'imported'
            ? 'Imported — pending upload'
            : 'Local only — pending upload',
        icon: (
          <svg className={sz} viewBox="0 0 12 12" fill="none">
            <path
              d="M6 9V3m-3 3l3-3 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };

    default:
      return {
        color: 'text-slate-500',
        glow: '',
        label: 'Sync status unknown',
        icon: (
          <svg className={sz} viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="3" opacity="0.5" />
          </svg>
        ),
      };
  }
}

const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  provenance,
  size = 'sm',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = getConfig(status, provenance, size);

  return (
    <span
      className={`relative inline-flex items-center justify-center ${dotClass(size)} ${config.color} ${config.glow} cursor-help`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={config.label}
    >
      {config.icon}
      {showTooltip && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 px-2 py-1 rounded shadow-lg pointer-events-none">
          {config.label}
        </span>
      )}
    </span>
  );
};

export default memo(SyncStatusBadge);
