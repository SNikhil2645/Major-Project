import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { uploadResume, getResumeAnalyses } from '../../api/resume';
import type { IResumeAnalysis } from '@placementor/shared';

const ACCEPTED = '.pdf,.docx';
const MAX_SIZE_MB = 10;

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreRingColor(score: number): string {
  if (score >= 70) return 'stroke-green-500';
  if (score >= 40) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          className={scoreRingColor(score)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl font-bold ${scoreColor(score)}`}>{score}</span>
      </div>
    </div>
  );
}

export function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<IResumeAnalysis | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [history, setHistory] = useState<IResumeAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getResumeAnalyses()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const validateFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return 'Only PDF and DOCX files are accepted.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setUploadError(err);
      setFile(null);
    } else {
      setUploadError(null);
      setFile(f);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setAnalysis(null);
    try {
      const result = await uploadResume(file);
      setAnalysis(result);
      setHistory((prev) => [result, ...prev]);
      setFile(null);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setUploadError(axiosErr.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
      <p className="text-gray-500">Upload your resume and get an ATS score with improvement suggestions.</p>

      <Card title="Upload Resume">
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {file ? (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="mt-1 text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setFile(null); setUploadError(null); }}>
                  Remove
                </Button>
                <Button size="sm" onClick={handleUpload} loading={uploading}>
                  Analyze Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drag & drop your resume here, or{' '}
                <button
                  className="font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => inputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-400">PDF or DOCX up to {MAX_SIZE_MB}MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={onInputChange}
          />
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Analyzing your resume...
          </div>
        )}
      </Card>

      {analysis && (
        <Card title="Analysis Results">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center">
              <ScoreGauge score={analysis.score} />
              <p className="mt-2 text-sm text-gray-500">ATS Score</p>
            </div>
            <div className="flex-1 space-y-4">
              {analysis.missingSections.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600">Missing Sections</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {analysis.missingSections.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-600">Suggestions</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-6">
                {analysis.keywordsFound.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600">Keywords Found</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {analysis.keywordsFound.map((kw) => (
                        <span key={kw} className="rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.keywordsMissing.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600">Keywords Missing</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {analysis.keywordsMissing.map((kw) => (
                        <span key={kw} className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card title="Analysis History">
        {historyLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">No previous analyses found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-lg font-bold ${scoreColor(item.score)}`}>{item.score}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
