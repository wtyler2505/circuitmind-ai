/**
 * Serial Communication Service
 * 
 * Handles Web Serial API interactions to read data from physical microcontrollers.
 */

export interface TelemetryPacket {
  componentId: string;
  pin?: string;
  value: string | number | boolean;
  unit?: string;
  timestamp: number;
}

export interface SerialOptions {
  baudRate: number;
}

class SerialService {
  private port: any | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private onDataCallback: ((packet: TelemetryPacket) => void) | null = null;
  private onRawDataCallback: ((data: string) => void) | null = null;
  private isReading: boolean = false;

  /**
   * Request access to a serial port from the user.
   */
  async requestPort(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported in this browser.');
      }
      this.port = await (navigator as any).serial.requestPort();
      return true;
    } catch (e) {
      console.error('Serial port request failed:', e);
      return false;
    }
  }

  /**
   * Open the requested port and start the read loop.
   */
  async openPort(options: SerialOptions = { baudRate: 115200 }): Promise<void> {
    if (!this.port) {
      const success = await this.requestPort();
      if (!success) return;
    }

    try {
      await this.port.open({ baudRate: options.baudRate });
      this.isReading = true;
      this.readLoop();
    } catch (e) {
      console.error('Failed to open serial port:', e);
      throw e;
    }
  }

  /**
   * Background loop to read serial data.
   */
  private async readLoop() {
    while (this.port?.readable && this.isReading) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      try {
        let buffer = '';
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            // Process complete lines
            if (buffer.includes('\n')) {
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep partial line in buffer
              for (const line of lines) {
                this.processLine(line.trim());
              }
            }
          }
        }
      } catch (error) {
        console.error('Serial read error:', error);
        break;
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  /**
   * Parse a single line of serial data into a telemetry packet.
   */
  private processLine(line: string) {
    if (!line) return;
    
    if (this.onRawDataCallback) {
      this.onRawDataCallback(line);
    }

    // Protocol Parser:
    // Pattern 1: "COMP_ID:PIN:VALUE" (e.g. "esp32:13:1")
    // Pattern 2: "PIN:VALUE" (e.g. "13:HIGH")
    // Pattern 3: "KEY=VALUE" (e.g. "TEMP=24.5")
    
    let packet: TelemetryPacket | null = null;

    if (line.includes(':')) {
      const parts = line.split(':');
      if (parts.length === 3) {
        packet = {
          componentId: parts[0],
          pin: parts[1],
          value: parts[2],
          timestamp: Date.now()
        };
      } else if (parts.length === 2) {
        packet = {
          componentId: 'auto', // Context-aware mapping will handle this
          pin: parts[0],
          value: parts[1],
          timestamp: Date.now()
        };
      }
    } else if (line.includes('=')) {
      const [key, val] = line.split('=');
      packet = {
        componentId: 'auto',
        pin: key.trim(),
        value: val.trim(),
        timestamp: Date.now()
      };
    }

    if (packet && this.onDataCallback) {
      this.onDataCallback(packet);
    }
  }

  /**
   * Register callback for parsed telemetry packets.
   */
  onData(callback: (packet: TelemetryPacket) => void) {
    this.onDataCallback = callback;
  }

  /**
   * Register callback for raw serial strings (for terminal).
   */
  onRawData(callback: (data: string) => void) {
    this.onRawDataCallback = callback;
  }

  /**
   * Close the connection and stop the loop.
   */
  async close() {
    this.isReading = false;
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.port) {
      await this.port.close();
    }
  }
}

export const serialService = new SerialService();
