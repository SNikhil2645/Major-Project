import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/ui';
import { listQuizzes } from '../../api/quiz';
import type { IQuiz, PaginationMeta } from '@placementor/shared';

const SUBJECTS = [
  'All',
  'c',
  'java',
  'python',
  'dbms',
  'computer-networks',
  'operating-systems',
  'sql',
  'cloud-computing',
] as const;

export function TechnicalPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, string> = { type: 'technical', page: String(page) };
        if (activeSubject !== 'All') params.subject = activeSubject;
        const result = await listQuizzes(params);
        setQuizzes(result.data);
        setMeta(result.meta ?? null);
      } catch {
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [activeSubject, page]);

  const difficultyBadge = (d: string) => {
    const map: Record<string, string> = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };
    return map[d] ?? 'bg-gray-100 text-gray-700';
  };

  const formatSubject = (sub?: string) =>
    sub
      ? sub
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technical Quizzes</h1>
        <p className="mt-1 text-gray-500">Test your knowledge in core technical subjects.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => { setActiveSubject(sub); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeSubject === sub
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sub === 'All' ? 'All' : formatSubject(sub)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && quizzes.length === 0 && (
        <div className="py-12 text-center text-gray-500">No quizzes available.</div>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="flex flex-col">
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyBadge(quiz.difficulty)}`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{quiz.subject ? formatSubject(quiz.subject) : ''}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{quiz.questions.length} questions</span>
                    <span>{quiz.timeLimit} min</span>
                  </div>
                  <Button className="mt-auto w-full" onClick={() => navigate(`/technical/quiz/${quiz._id}`)}>
                    Start Quiz
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded px-3 py-1 text-sm ${
                    page === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
