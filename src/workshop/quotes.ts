import Papa from 'papaparse';
import csv from '../../public/hype.csv?raw';

interface QuoteRow {
  Quote_Description?: string;
  Person_Organization?: string;
  Hype_Value?: string;
  Direct_Link?: string;
}

const parsed = Papa.parse<QuoteRow>(csv, { header: true, skipEmptyLines: true });
if (parsed.errors.length) throw new Error('The archived quotation CSV could not be parsed.');

// Retain the original selection and wording; only HTTP(S) destinations become links.
export const quotes = parsed.data
  .filter(row => row.Quote_Description && row.Hype_Value)
  .map(row => ({
    quote: (row.Quote_Description || '').replace(/"/g, ''),
    speaker: row.Person_Organization || 'Unknown',
    url: /^https?:\/\//.test(row.Direct_Link || '') ? row.Direct_Link : undefined,
  }));
