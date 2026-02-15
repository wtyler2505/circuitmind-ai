import { useCallback, useEffect, useRef } from 'react';

/**
 * useBlobUrl - Manages blob URL lifecycle to prevent memory leaks.
 *
 * Tracks all created blob URLs and automatically revokes them on unmount.
 * Use this instead of raw URL.createObjectURL() anywhere in the app.
 *
 * Usage:
 *   const { createUrl, revokeUrl, revokeAll } = useBlobUrl();
 *   const url = createUrl(blob);
 *   // URL is auto-revoked on unmount, or call revokeUrl(url) manually
 */
export function useBlobUrl() {
  const urlsRef = useRef<Set<string>>(new Set());

  const createUrl = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  }, []);

  const revokeUrl = useCallback((url: string): void => {
    if (urlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    }
  }, []);

  const revokeAll = useCallback((): void => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      // Revoke all tracked URLs on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return { createUrl, revokeUrl, revokeAll };
}
