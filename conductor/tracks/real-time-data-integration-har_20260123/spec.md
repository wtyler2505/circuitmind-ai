# Spec: Real-Time Data Integration (Hardware Telemetry)

## Goal
Close the loop between digital design and physical hardware by streaming real-time data from microcontrollers (serial logs, sensor values) directly onto the diagram components.

## Background
Prototyping currently requires constant context-switching between the wiring diagram and a separate Serial Monitor (e.g., Arduino IDE). This feature integrates the serial output into the visual design, making debugging intuitive.

## Architecture
- **Web Serial API:** Enables the browser to communicate directly with hardware over USB.
- **Telemetry Worker:** Serial reading and heavy parsing will be offloaded to a Web Worker to prevent UI blocking.
- **Mapping Logic:** A flexible parser will attempt to match serial log keys to Component IDs and Pin names in the active diagram.

## Data Model
```typescript
interface TelemetryPacket {
  componentId: string;
  pin?: string; // Optional: value could apply to whole component
  value: string | number | boolean;
  unit?: string; // e.g., "°C", "V"
  timestamp: number;
}

interface TelemetryState {
  isActive: boolean;
  connectedPort?: string;
  liveData: Record<string, TelemetryPacket>; // Keyed by componentId:pin
}
```

## Security & Privacy
- Web Serial requires explicit user permission per device.
- Data is processed entirely locally; no serial logs are sent to the AI unless specifically requested by the user for analysis.
