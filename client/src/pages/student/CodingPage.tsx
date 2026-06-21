import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { listChallenges } from '../../api/coding';
import type { ICodingChallenge } from '@placementor/shared';

const difficulties = ['All', 'easy', 'medium', 'hard'] as const;

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export function CodingPage() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ICodingChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    listChallenges()
      .then((res) => setChallenges(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load challenges'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? challenges : challenges.filter((c) => c.difficulty === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Coding Practice</h1>
        <Card>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coding Practice</h1>
      <p className="text-gray-500">Solve coding challenges and improve your problem-solving skills.</p>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((d) => (
          <Button
            key={d}
            variant={filter === d ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(d)}
          >
            {d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-sm">No challenges found.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((challenge) => (
            <Card key={challenge._id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[challenge.difficulty]}`}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {challenge.description || challenge.problemStatement}
              </p>
              {challenge.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {challenge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-4">
                <Button
                  size="sm"
                  onClick={() => navigate(`/coding/${challenge._id}`)}
                >
                  Solve Challenge
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
