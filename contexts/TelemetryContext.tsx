import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { serialService, TelemetryPacket } from '../services/serialService';

interface TelemetryContextType {
  liveData: Record<string, TelemetryPacket>; // Key: compId:pin
  isConnected: boolean;
  connect: (baudRate?: number) => Promise<void>;
  disconnect: () => Promise<void>;
  rawLogs: string[];
  clearLogs: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

/**
 * TelemetryProvider manages the state of real-time hardware data.
 * It bridges the SerialService with the React UI.
 */
export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [liveData, setLiveData] = useState<Record<string, TelemetryPacket>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [rawLogs, setRawLogs] = useState<string[]>([]);

  useEffect(() => {
    // Setup listeners for serial data
    serialService.onData((packet) => {
      const key = `${packet.componentId}:${packet.pin || 'default'}`;
      setLiveData((prev) => ({
        ...prev,
        [key]: packet
      }));
    });

    serialService.onRawData((line) => {
      const timestamp = new Date().toLocaleTimeString();
      const entry = `[${timestamp}] ${line}`;
      setRawLogs((prev) => [...prev.slice(-499), entry]); // Keep last 500 lines
    });

    return () => {
      serialService.close();
    };
  }, []);

  const connect = useCallback(async (baudRate: number = 115200) => {
    try {
      await serialService.openPort({ baudRate });
      setIsConnected(true);
    } catch (e) {
      console.error('Failed to connect hardware:', e);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await serialService.close();
    setIsConnected(false);
  }, []);

  const clearLogs = useCallback(() => {
    setRawLogs([]);
  }, []);

  return (
    <TelemetryContext.Provider value={{
      liveData,
      isConnected,
      connect,
      disconnect,
      rawLogs,
      clearLogs
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};

/**
 * Hook to access live hardware telemetry data.
 */
export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
