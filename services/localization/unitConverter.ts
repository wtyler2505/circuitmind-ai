export type MeasurementSystem = 'metric' | 'imperial';
export type SymbolStandard = 'ieee' | 'iec';

class UnitConverter {
  convert(value: number, from: 'mm' | 'mils' | 'inch', to: 'mm' | 'mils' | 'inch'): number {
    // Normalize to mm first
    let mm = value;
    if (from === 'mils') mm = value * 0.0254;
    if (from === 'inch') mm = value * 25.4;

    // Convert to target
    if (to === 'mm') return mm;
    if (to === 'mils') return mm / 0.0254;
    if (to === 'inch') return mm / 25.4;
    
    return value;
  }

  format(value: number, system: MeasurementSystem): string {
    if (system === 'metric') {
      return `${value.toFixed(2)} mm`;
    } else {
      // Prefer mils for small values
      const mils = this.convert(value, 'mm', 'mils');
      if (mils < 1000) return `${Math.round(mils)} mils`;
      return `${(mils / 1000).toFixed(3)} in`;
    }
  }

  getResistorSymbol(standard: SymbolStandard): string {
    return standard === 'ieee' ? 'ZIGZAG' : 'BOX';
  }
}

export const unitConverter = new UnitConverter();
