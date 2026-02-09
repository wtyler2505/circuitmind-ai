import type { WireConnection } from '../../../types';

/**
 * Resolve wire color based on user-configured pin-to-color mapping.
 * Supports exact match and fuzzy match for common pin names.
 */
export function resolveWireColor(conn: WireConnection, map?: Record<string, string>): string | undefined {
  if (!map) return undefined;

  // Exact match
  if (map[conn.fromPin]) return map[conn.fromPin];
  if (map[conn.toPin]) return map[conn.toPin];

  // Fuzzy match for common pin types
  const upperFrom = conn.fromPin.toUpperCase();
  const upperTo = conn.toPin.toUpperCase();

  if (map['VCC'] && (upperFrom.includes('VCC') || upperFrom.includes('5V') || upperFrom.includes('3.3V') || upperTo.includes('VCC'))) return map['VCC'];
  if (map['GND'] && (upperFrom.includes('GND') || upperTo.includes('GND'))) return map['GND'];
  if (map['SDA'] && (upperFrom.includes('SDA') || upperTo.includes('SDA'))) return map['SDA'];
  if (map['SCL'] && (upperFrom.includes('SCL') || upperTo.includes('SCL'))) return map['SCL'];

  return undefined;
}
