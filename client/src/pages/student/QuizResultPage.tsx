import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/ui';
import { getAttemptById, getQuizById } from '../../api/quiz';
import type { IAttempt, IQuiz } from '@placementor/shared';

export function QuizResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<IAttempt | null>(null);
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    const fetch = async () => {
      try {
        const data = await getAttemptById(attemptId);
        setAttempt(data);
        try {
          const q = await getQuizById(data.quizId);
          setQuiz(q);
        } catch {
          // quiz fetch is best-effort
        }
      } catch {
        setError('Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [attemptId]);

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

  if (!attempt) {
    return <div className="py-12 text-center text-gray-500">Result not found.</div>;
  }

  const percentage = attempt.percentage;
  const scoreColor =
    percentage >= 70
      ? 'text-green-600'
      : percentage >= 40
        ? 'text-yellow-600'
        : 'text-red-600';

  const bgColor =
    percentage >= 70
      ? 'bg-green-50 border-green-200'
      : percentage >= 40
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-red-50 border-red-200';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quiz Result</h1>
        <p className="mt-1 text-gray-500">{attempt.quizTitle}</p>
      </div>

      <div className={`rounded-xl border-2 p-6 text-center ${bgColor}`}>
        <p className={`text-5xl font-bold ${scoreColor}`}>{Math.round(percentage)}%</p>
        <p className="mt-2 text-lg text-gray-600">
          {attempt.score} / {attempt.totalMarks} marks
        </p>
        <p className="text-sm text-gray-500">Time taken: {formatTime(attempt.timeTaken)}</p>
      </div>

      <Card title="Question Summary">
        <div className="space-y-4">
          {attempt.answers.map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            const question = quiz?.questions[ans.questionIndex];
            return (
              <div
                key={idx}
                className={`rounded-lg border p-4 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    Q{idx + 1}. {question?.questionText ?? `Question ${ans.questionIndex + 1}`}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span>
                      Your answer:{' '}
                      <span className={isCorrect ? 'font-semibold text-green-700' : 'font-semibold text-red-700'}>
                        {question ? question.options[ans.selectedAnswer] : `Option ${ans.selectedAnswer}`}
                      </span>
                    </span>
                    {!isCorrect && question && (
                      <span>
                        Correct:{' '}
                        <span className="font-semibold text-green-700">{question.options[question.correctAnswer]}</span>
                      </span>
                    )}
                  </div>
                  {question?.explanation && (
                    <p className="text-sm text-gray-500">{question.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Quiz
        </Button>
        <Button onClick={() => navigate('/aptitude')}>
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}
