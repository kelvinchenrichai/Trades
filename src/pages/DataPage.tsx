/**
 * No-Brain EV Lab — Data Registry & Session Calendar Management
 */

import React, { useState } from 'react';
import { Dataset } from '../types';
import { INITIAL_DATASETS } from '../data/datasets';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Database,
  Upload,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Globe,
  Layers,
} from 'lucide-react';

interface ParsedCSVRow {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  [key: string]: string;
}

export const DataPage: React.FC = () => {
  const [datasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setValidationStatus('INVALID');
          setErrorMessage('CSV file must contain at least 1 header line and 1 data row.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        setCsvHeaders(headers);

        // Required OHLCV check
        const required = ['timestamp', 'open', 'high', 'low', 'close'];
        const missing = required.filter((r) => !headers.some((h) => h.includes(r)));

        if (missing.length > 0) {
          setValidationStatus('INVALID');
          setErrorMessage(`Missing required OHLCV columns: ${missing.join(', ')}`);
        } else {
          setValidationStatus('VALID');
          setErrorMessage(null);
        }

        // Preview first 50 rows
        const rows: ParsedCSVRow[] = [];
        for (let i = 1; i < Math.min(lines.length, 51); i++) {
          const vals = lines[i].split(',');
          const rowObj: any = {};
          headers.forEach((h, colIdx) => {
            rowObj[h] = vals[colIdx]?.trim() || '';
          });
          rows.push(rowObj);
        }
        setParsedRows(rows);
      } catch (err: any) {
        setValidationStatus('INVALID');
        setErrorMessage(err?.message || 'Failed to parse CSV file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Header Info */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Institutional Market Data &amp; Contract Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Clean continuous futures, back-adjusted contract splits, and UTC timestamp synchronization.
            </p>
          </div>
        </div>

        {/* Datasets Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">SYMBOL</th>
                <th className="py-2.5 px-3">MARKET</th>
                <th className="py-2.5 px-3">CONTRACT TYPE</th>
                <th className="py-2.5 px-3">RESOLUTION</th>
                <th className="py-2.5 px-3">DATE RANGE</th>
                <th className="py-2.5 px-3 text-right">TOTAL ROWS</th>
                <th className="py-2.5 px-3 text-right">MISSING %</th>
                <th className="py-2.5 px-3">TIMEZONE</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-num">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-bold text-slate-200">{d.symbol}</td>
                  <td className="py-3 px-3 text-slate-300">{d.market}</td>
                  <td className="py-3 px-3 text-blue-400 font-semibold">{d.contractType}</td>
                  <td className="py-3 px-3 text-slate-300">{d.resolution}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {d.startDate} &rarr; {d.endDate}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200 font-bold">
                    {d.rows.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                    {d.missingDataPct}%
                  </td>
                  <td className="py-3 px-3 text-slate-400">{d.timezone}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Calendar & Timezone Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#0a0f18] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            CME / NQ SESSION RULES
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>RTH:</strong> 09:30 — 16:00 ET<br />
            <strong>Globex:</strong> 18:00 (prev) — 17:00 ET<br />
            <strong>Daily Reset:</strong> 17:00 ET Daily Settlement maintenance.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0f18] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            COMEX / GC GOLD SESSION
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>London Fix:</strong> 03:00 / 10:00 ET<br />
            <strong>NY Open:</strong> 08:20 — 13:30 ET pit session<br />
            <strong>Daily Reset:</strong> 17:00 ET.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0f18] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Calendar className="w-4 h-4" />
            CRYPTO PERP (24/7 UTC)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Continuous:</strong> 24 hours / 7 days<br />
            <strong>Funding Intervals:</strong> 00:00, 08:00, 16:00 UTC<br />
            <strong>Daily Close:</strong> 00:00 UTC candle close.
          </p>
        </div>
      </div>

      {/* Browser CSV File Upload & Live Validator */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Local CSV Dataset Ingestion &amp; Schema Inspector
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test any custom OHLCV CSV file directly in browser memory. Future Codex backend will ingest this into live database.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="p-6 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/40 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-slate-800 text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-200">
              {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Select or Drop OHLCV CSV File'}
            </div>
            <p className="text-[11px] text-slate-400">
              Format: timestamp, open, high, low, close, volume (Auto-detected)
            </p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 py-2 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors">
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === 'VALID' && (
          <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Valid OHLCV Schema Confirmed!</strong> Loaded {parsedRows.length} sample rows for preview.
            </span>
          </div>
        )}

        {validationStatus === 'INVALID' && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Schema Validation Failed:</strong> {errorMessage}
            </span>
          </div>
        )}

        {/* Live Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Previewing First {parsedRows.length} Records:</span>
              <span className="text-[10px] text-slate-500">In-Memory Sandbox</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] border-b border-slate-800 uppercase">
                    {csvHeaders.map((h, i) => (
                      <th key={i} className="py-2 px-2.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num text-[11px]">
                  {parsedRows.slice(0, 10).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40">
                      {csvHeaders.map((h, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-2.5 text-slate-300">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
