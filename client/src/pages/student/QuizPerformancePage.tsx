import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/ui';
import { getPerformance, getAttempts } from '../../api/quiz';
import type { IAttempt } from '@placementor/shared';

interface CategoryPerf {
  name: string;
  average: number;
  count: number;
}

interface PerformanceData {
  totalAttempts: number;
  overallAverage: number;
  byCategory: CategoryPerf[];
  bySubject: CategoryPerf[];
}

export function QuizPerformancePage() {
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<IAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [perf, attempts] = await Promise.all([getPerformance(), getAttempts()]);
        setPerformance(perf as PerformanceData);
        setRecentAttempts(attempts.slice(0, 10));
      } catch {
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  const categories = performance?.byCategory ?? [];
  const subjects = performance?.bySubject ?? [];
  const maxCategoryScore = Math.max(...categories.map((c) => c.average), ...subjects.map((s) => s.average), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quiz Performance</h1>
        <p className="mt-1 text-gray-500">Track your quiz progress and improvement.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card title="Total Attempts">
          <p className="text-3xl font-bold text-primary-600">{performance?.totalAttempts ?? 0}</p>
        </Card>
        <Card title="Overall Average Score">
          <p className="text-3xl font-bold text-primary-600">
            {performance ? `${Math.round(performance.overallAverage)}%` : '--'}
          </p>
        </Card>
      </div>

      {categories.length > 0 && (
        <Card title="Performance by Aptitude Category">
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {cat.name
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </span>
                  <span className="text-gray-500">
                    {Math.round(cat.average)}% ({cat.count} attempts)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-primary-600 transition-all"
                    style={{ width: `${(cat.average / maxCategoryScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {subjects.length > 0 && (
        <Card title="Performance by Technical Subject">
          <div className="space-y-4">
            {subjects.map((sub) => (
              <div key={sub.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {sub.name
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </span>
                  <span className="text-gray-500">
                    {Math.round(sub.average)}% ({sub.count} attempts)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-primary-600 transition-all"
                    style={{ width: `${(sub.average / maxCategoryScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recentAttempts.length > 0 && (
        <Card title="Recent Attempts">
          <div className="space-y-3">
            {recentAttempts.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{a.quizTitle}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round(a.percentage)}% | {a.score}/{a.totalMarks} marks
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/quiz-result/${a._id}`)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recentAttempts.length === 0 && (
        <Card title="Recent Attempts">
          <p className="text-sm text-gray-500">No attempts yet. Start a quiz to see your performance.</p>
        </Card>
      )}
    </div>
  );
}
