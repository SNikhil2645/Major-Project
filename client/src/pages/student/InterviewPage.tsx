import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { startInterview, getInterviews } from '../../api/interview';
import type { IMockInterview, InterviewRole } from '@placementor/shared';

const roles: { value: InterviewRole; label: string }[] = [
  { value: 'software-developer', label: 'Software Developer' },
  { value: 'full-stack-developer', label: 'Full Stack Developer' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'cloud-support-engineer', label: 'Cloud Support Engineer' },
];

export function InterviewPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<InterviewRole>('software-developer');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [interviews, setInterviews] = useState<IMockInterview[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getInterviews()
      .then(setInterviews)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const interview = await startInterview(role, totalQuestions);
      navigate(`/interview/${interview._id}`);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setStartError(axiosErr.response?.data?.error || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
      <p className="text-gray-500">Practice for your placement interviews with AI-powered questions.</p>

      <Card title="Start New Interview">
        <div className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as InterviewRole)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="questions" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              id="questions"
              type="number"
              min={1}
              max={20}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <Button onClick={handleStart} loading={starting}>
            Start Interview
          </Button>
          {startError && <p className="text-sm text-red-600">{startError}</p>}
        </div>
      </Card>

      <Card title="Past Interviews">
        {historyLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : interviews.length === 0 ? (
          <p className="text-sm text-gray-500">No past interviews yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {interviews.map((interview) => {
              const roleLabel = roles.find((r) => r.value === interview.role)?.label || interview.role;
              return (
                <div key={interview._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{roleLabel}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      &middot; {interview.totalQuestions} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.overallScore != null && (
                      <span className="text-sm font-bold text-primary-600">
                        {interview.overallScore}%
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        interview.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {interview.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/interview/${interview._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
