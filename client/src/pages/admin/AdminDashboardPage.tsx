import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import apiClient from '../../api/client';
import type { ApiResponse } from '@placementor/shared';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalCodingChallenges: number;
  totalResources: number;
  totalAttempts: number;
  recentRegistrations: number;
  averageQuizScore: number;
  topPerformers: Array<{
    name: string;
    email: string;
    averageScore: number;
  }>;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get<ApiResponse<AdminStats>>('/dashboard/admin')
      .then((res) => setStats(res.data.data!))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Total Quizzes', value: stats.totalQuizzes },
    { title: 'Coding Challenges', value: stats.totalCodingChallenges },
    { title: 'Resources', value: stats.totalResources },
    { title: 'Total Attempts', value: stats.totalAttempts },
    { title: 'Recent Registrations (7d)', value: stats.recentRegistrations },
    { title: 'Average Quiz Score', value: `${stats.averageQuizScore.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-500">Platform overview and statistics.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title} title={s.title}>
            <p className="text-3xl font-bold text-primary-600">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card title="Top Performers">
        {stats.topPerformers.length === 0 ? (
          <p className="text-sm text-gray-500">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Average Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topPerformers.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.email}</td>
                    <td className="px-4 py-3 font-medium text-primary-600">{p.averageScore.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
