import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getReadiness, recalculateReadiness } from '../../api/readiness';
import type { IReadinessScore } from '@placementor/shared';

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getBarColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getGaugeColor(score: number): string {
  if (score >= 75) return 'border-green-500';
  if (score >= 50) return 'border-yellow-500';
  return 'border-red-500';
}

interface BreakdownItem {
  label: string;
  score: number;
  weight: number;
  key: keyof IReadinessScore;
}

export function ReadinessPage() {
  const [readiness, setReadiness] = useState<IReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    getReadiness()
      .then(setReadiness)
      .finally(() => setLoading(false));
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const result = await recalculateReadiness();
      setReadiness(result);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!readiness) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Readiness</h1>
        <p className="text-gray-500">Could not load readiness data.</p>
      </div>
    );
  }

  const breakdown: BreakdownItem[] = [
    { label: 'Aptitude', score: readiness.aptitude.score, weight: 30, key: 'aptitude' },
    { label: 'Technical', score: readiness.technical.score, weight: 25, key: 'technical' },
    { label: 'Resume', score: readiness.resume.score, weight: 20, key: 'resume' },
    { label: 'Coding', score: readiness.coding.score, weight: 25, key: 'coding' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Readiness Score</h1>
          <p className="text-gray-500">Track your placement preparedness</p>
        </div>
        <Button onClick={handleRecalculate} loading={recalculating}>
          Recalculate
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div
            className={`h-48 w-48 rounded-full border-8 ${getGaugeColor(readiness.overall)} flex items-center justify-center`}
          >
            <span className={`text-5xl font-bold ${getScoreColor(readiness.overall)}`}>
              {readiness.overall}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500">Overall Readiness Score</p>
      </div>

      <Card title="Score Breakdown">
        <div className="space-y-5 py-2">
          {breakdown.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-500">
                  <span className={`font-semibold ${getScoreColor(item.score)}`}>{item.score}</span>
                  /100 &middot; {item.weight}% weight
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
