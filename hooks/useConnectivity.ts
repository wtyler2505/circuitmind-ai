import { useState, useEffect } from 'react';
import { connectivityService } from '../services/connectivityService';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(connectivityService.getIsOnline());

  useEffect(() => {
    return connectivityService.onStatusChange((status) => {
      setIsOnline(status);
    });
  }, []);

  return { isOnline };
}
