import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/ui';
import { listQuizzes } from '../../api/quiz';
import type { IQuiz, PaginationMeta } from '@placementor/shared';

const CATEGORIES = ['All', 'quantitative-aptitude', 'logical-reasoning', 'verbal-ability', 'data-interpretation'] as const;

export function AptitudePage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, string> = { type: 'aptitude', page: String(page) };
        if (activeCategory !== 'All') params.category = activeCategory;
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
  }, [activeCategory, page]);

  const difficultyBadge = (d: string) => {
    const map: Record<string, string> = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };
    return map[d] ?? 'bg-gray-100 text-gray-700';
  };

  const formatCategory = (cat?: string) =>
    cat
      ? cat
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aptitude Preparation</h1>
        <p className="mt-1 text-gray-500">
          Practice quantitative aptitude, logical reasoning, verbal ability, and data interpretation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'All' ? 'All' : formatCategory(cat)}
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
                  <p className="text-sm text-gray-500">{quiz.category ? formatCategory(quiz.category) : ''}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{quiz.questions.length} questions</span>
                    <span>{quiz.timeLimit} min</span>
                  </div>
                  <Button className="mt-auto w-full" onClick={() => navigate(`/aptitude/quiz/${quiz._id}`)}>
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
