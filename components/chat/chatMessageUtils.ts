import React from 'react';

/** Format a message timestamp for display */
export function formatTimestamp(timestamp: number): string {
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

/** Get the SVG icon for an action type */
export function getActionIcon(type: string): React.ReactNode {
  switch (type) {
    case 'highlight':
    case 'highlightWire':
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
          })
        )
      );
    case 'centerOn':
    case 'zoomTo':
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          })
        )
      );
    case 'openInventory':
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          })
        )
      );
    case 'addComponent':
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
          })
        )
      );
    case 'createConnection':
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
          })
        )
      );
    default:
      return (
        React.createElement('svg', { className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', {
            strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
            d: 'M13 10V3L4 14h7v7l9-11h-7z'
          })
        )
      );
  }
}
