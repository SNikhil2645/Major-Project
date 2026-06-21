import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getStudentDashboard } from '../../api/dashboard';
import type { DashboardStats } from '@placementor/shared';

const ACTIVITY_ICONS: Record<string, string> = {
  quiz_attempted: '📝',
  coding_solved: '💻',
  resume_uploaded: '📄',
  interview_completed: '🎤',
  readiness_updated: '📊',
};

function getScoreColor(score: number | null): string {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getGaugeColor(score: number | null): string {
  if (score === null || score === undefined) return 'border-gray-300';
  if (score >= 75) return 'border-green-500';
  if (score >= 50) return 'border-yellow-500';
  return 'border-red-500';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Could not load dashboard data.</p>
      </div>
    );
  }

  const { quizzesAttempted, averageScore, codingSolved, resumeScore, readinessScore, recentActivity } = stats;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500">Your placement preparation overview</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              📝
            </div>
            <div>
              <p className="text-sm text-gray-500">Quizzes Attempted</p>
              <p className="text-2xl font-bold text-gray-900">{quizzesAttempted}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              🎯
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore != null ? `${averageScore.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              💻
            </div>
            <div>
              <p className="text-sm text-gray-500">Coding Solved</p>
              <p className="text-2xl font-bold text-gray-900">{codingSolved}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              📄
            </div>
            <div>
              <p className="text-sm text-gray-500">Resume Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(resumeScore)}`}>
                {resumeScore != null ? `${resumeScore}` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900">Readiness Score</h2>
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div
            className={`h-40 w-40 rounded-full border-8 ${getGaugeColor(readinessScore)} flex items-center justify-center`}
          >
            <span className={`text-4xl font-bold ${getScoreColor(readinessScore)}`}>
              {readinessScore != null ? readinessScore : '--'}
            </span>
          </div>
        </div>
        <Link to="/student/readiness" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View Breakdown &rarr;
        </Link>
      </div>

      <Card title="Recent Activity">
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">No recent activity. Start by attempting a quiz!</p>
          ) : (
            recentActivity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className="text-xl">{ACTIVITY_ICONS[item.action] ?? '📌'}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 capitalize">
                    {item.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatTimestamp(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
