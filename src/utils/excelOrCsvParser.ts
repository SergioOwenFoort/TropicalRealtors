import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface CsvParseResult {
  data: Record<string, any>[];
  errors: {
    row: number;
    message: string;
  }[];
}

export async function parseExcelOrCsvFile(file: File): Promise<CsvParseResult> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    // Use PapaParse for CSV
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const errors = results.errors.map(error => ({
            row: typeof error.row === 'number' ? error.row : -1,
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
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    // Use SheetJS for Excel
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          resolve({ data: json, errors: [] });
        } catch (err: any) {
          reject(new Error(`Excel parsing error: ${err.message}`));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file.'));
      };
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error('Unsupported file type. Please upload a .csv or .xlsx file.');
  }
}
