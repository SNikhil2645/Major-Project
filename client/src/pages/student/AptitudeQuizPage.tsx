import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Spinner } from '../../components/ui';
import { startQuizAttempt, submitQuizAttempt } from '../../api/quiz';
import type { IQuiz } from '@placementor/shared';

export function AptitudeQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!quizId) return;
    const init = async () => {
      try {
        const data = await startQuizAttempt(quizId);
        setQuiz(data.quiz);
        setRemainingSeconds(data.quiz.timeLimit * 60);
      } catch {
        setError('Failed to start quiz');
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => clearInterval(timerRef.current);
  }, [quizId]);

  useEffect(() => {
    if (loading || !quiz || remainingSeconds <= 0) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, quiz]);

  const handleSubmit = useCallback(
    async (overrideRemaining?: number) => {
      if (!quiz || !quizId || finished) return;
      setFinished(true);
      setSubmitting(true);
      clearInterval(timerRef.current);

      const seconds = overrideRemaining ?? remainingSeconds;
      const timeTaken = quiz.timeLimit * 60 - seconds;
      const ansList = Object.entries(answers).map(([qIdx, sAns]) => ({
        questionIndex: Number(qIdx),
        selectedAnswer: sAns,
      }));

      try {
        const attempt = await submitQuizAttempt(quizId, ansList, timeTaken);
        navigate(`/quiz-result/${attempt._id}`);
      } catch {
        setError('Failed to submit quiz');
        setSubmitting(false);
        setFinished(false);
      }
    },
    [quiz, quizId, answers, remainingSeconds, finished, navigate],
  );

  const selectAnswer = (optionIndex: number) => {
    if (submitting) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

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

  if (!quiz) {
    return <div className="py-12 text-center text-gray-500">Quiz not found.</div>;
  }

  const question = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === totalQuestions - 1;

  const timerColor =
    remainingSeconds <= 60
      ? 'text-red-600'
      : remainingSeconds <= 120
        ? 'text-yellow-600'
        : 'text-gray-700';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
        <span className={`text-lg font-semibold ${timerColor}`}>{formatTime(remainingSeconds)}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span>
          Answered: {answeredCount}/{totalQuestions}
        </span>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <div className="space-y-6">
              <p className="text-base font-medium text-gray-900">{question.questionText}</p>

              <div className="space-y-3">
                {question.options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      disabled={submitting}
                      onClick={() => selectAnswer(idx)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2 font-medium">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={currentIndex === 0 || submitting}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                Previous
              </Button>
              {!isLast && (
                <Button
                  disabled={submitting}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next
                </Button>
              )}
            </div>
            {isLast && (
              <Button
                variant="primary"
                loading={submitting}
                onClick={() => handleSubmit()}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>

        <div className="hidden w-32 shrink-0 sm:block">
          <Card>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Questions</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {quiz.questions.map((_, idx) => {
                const isAnswered = idx in answers;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                      currentIndex === idx
                        ? 'ring-2 ring-primary-500'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
