
export interface ScrapedPin {
  number: number;
  name: string;
  function: string;
}

export interface ScrapedSpecs {
  voltageMin: number;
  voltageMax: number;
  currentLimit?: number;
  logicLevel: '3.3V' | '5V' | 'Adjustable' | 'Other';
}

export interface ScrapedMetadata {
  pins: ScrapedPin[];
  specs: ScrapedSpecs;
  confidence: number;
}

class DatasheetProcessor {
  /**
   * Converts a File to base64 string for API consumption.
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Utility to validate the structure of scraped data.
   */
  validateMetadata(data: any): data is ScrapedMetadata {
    return (
      data &&
      Array.isArray(data.pins) &&
      typeof data.specs === 'object' &&
      typeof data.confidence === 'number'
    );
  }
}

export const datasheetProcessor = new DatasheetProcessor();
