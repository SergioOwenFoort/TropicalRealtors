import Papa from 'papaparse';

export interface CsvParseResult {
  data: Record<string, any>[];
  errors: {
    row: number;
    message: string;
  }[];
}

export async function parseFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, // First row is headers
      dynamicTyping: true, // Automatically convert numbers
      skipEmptyLines: true,
      complete: (results) => {
        const errors = results.errors.map(error => ({
          row: error.row,
          message: error.message
        }));

        resolve({
          data: results.data as Record<string, any>[],
          errors
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}
