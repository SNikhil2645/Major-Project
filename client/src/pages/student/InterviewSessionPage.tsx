import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getInterviewById, submitAnswer } from '../../api/interview';
import type { IMockInterview } from '@placementor/shared';

export function InterviewSessionPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<IMockInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showingEvaluation, setShowingEvaluation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchInterview = useCallback(async () => {
    if (!interviewId) return;
    try {
      const data = await getInterviewById(interviewId);
      setInterview(data);
      setShowingEvaluation(false);
      setAnswer('');
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to load interview');
    }
  }, [interviewId]);

  useEffect(() => {
    setLoading(true);
    fetchInterview().finally(() => setLoading(false));
  }, [fetchInterview]);

  const handleSubmitAnswer = async () => {
    if (!interviewId || !answer.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await submitAnswer(interviewId, answer);
      setInterview(updated);
      setShowingEvaluation(true);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setSubmitError(axiosErr.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interview) return;
    const nextIdx = interview.currentQuestion;
    if (nextIdx < interview.totalQuestions) {
      setShowingEvaluation(false);
      setAnswer('');
      setSubmitError(null);
      fetchInterview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Session</h1>
        <Card>
          <p className="text-red-600">{error || 'Interview not found'}</p>
        </Card>
      </div>
    );
  }

  const isCompleted = interview.status === 'completed';
  const currentQ = interview.questions[interview.currentQuestion];
  const hasEvaluation = currentQ?.evaluation != null;

  if (isCompleted) {
    const answered = interview.questions.filter((q) => q.evaluation != null);
    const avgScore =
      answered.length > 0
        ? Math.round(answered.reduce((sum, q) => sum + (q.evaluation?.score ?? 0), 0) / answered.length)
        : 0;
    const avgTech =
      answered.length > 0
        ? Math.round(
            answered.reduce((sum, q) => sum + (q.evaluation?.technicalAccuracy ?? 0), 0) / answered.length,
          )
        : 0;
    const avgComm =
      answered.length > 0
        ? Math.round(answered.reduce((sum, q) => sum + (q.evaluation?.communication ?? 0), 0) / answered.length)
        : 0;

    const weakAreas = interview.questions
      .filter((q) => q.evaluation && q.evaluation.score < 50)
      .map((q) => q.question);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Complete</h1>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">Overall Score</p>
            <p className="text-3xl font-bold text-primary-600">{avgScore}%</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Technical Accuracy</p>
            <p className="text-3xl font-bold text-primary-600">{avgTech}%</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Communication</p>
            <p className="text-3xl font-bold text-primary-600">{avgComm}%</p>
          </Card>
        </div>

        <Card title="Per-Question Breakdown">
          <div className="divide-y divide-gray-100">
            {interview.questions.map((q, i) => (
              <div key={i} className="py-3">
                <p className="text-sm font-medium text-gray-900">
                  Q{i + 1}. {q.question}
                </p>
                {q.evaluation ? (
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>
                      Score: <strong className={q.evaluation.score >= 50 ? 'text-green-600' : 'text-red-600'}>{q.evaluation.score}%</strong>
                    </span>
                    {q.evaluation.technicalAccuracy != null && (
                      <span>
                        Technical: <strong>{q.evaluation.technicalAccuracy}%</strong>
                      </span>
                    )}
                    {q.evaluation.communication != null && (
                      <span>
                        Communication: <strong>{q.evaluation.communication}%</strong>
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Not answered</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {weakAreas.length > 0 && (
          <Card title="Areas for Improvement">
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {weakAreas.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Card>
        )}

        <Button variant="outline" onClick={() => navigate('/interview')}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Session</h1>
          <p className="mt-1 text-sm text-gray-500">
            Question {interview.currentQuestion + 1} of {interview.totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: interview.totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-6 rounded-full ${
                i < interview.currentQuestion
                  ? 'bg-green-500'
                  : i === interview.currentQuestion
                    ? 'bg-primary-500'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <Card title={`Question ${interview.currentQuestion + 1}`}>
        <p className="text-sm leading-relaxed text-gray-800">{currentQ?.question}</p>
      </Card>

      {showingEvaluation && hasEvaluation ? (
        <Card title="Evaluation">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Score</p>
                <p className={`text-xl font-bold ${(currentQ.evaluation?.score ?? 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentQ.evaluation?.score}%
                </p>
              </div>
              {currentQ.evaluation?.technicalAccuracy != null && (
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Technical Accuracy</p>
                  <p className="text-xl font-bold text-primary-600">{currentQ.evaluation.technicalAccuracy}%</p>
                </div>
              )}
              {currentQ.evaluation?.communication != null && (
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Communication</p>
                  <p className="text-xl font-bold text-primary-600">{currentQ.evaluation.communication}%</p>
                </div>
              )}
            </div>
            {currentQ.evaluation?.feedback && (
              <div>
                <p className="text-sm font-medium text-gray-700">Feedback</p>
                <p className="mt-1 text-sm text-gray-600">{currentQ.evaluation.feedback}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleNextQuestion}>
                {interview.currentQuestion + 1 >= interview.totalQuestions
                  ? 'View Results'
                  : 'Next Question'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Your Answer">
          <div className="space-y-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Type your answer here..."
            />
            <Button onClick={handleSubmitAnswer} loading={submitting} disabled={!answer.trim()}>
              Submit Answer
            </Button>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </div>
        </Card>
      )}

      <Button variant="ghost" onClick={() => navigate('/interview')}>
        &larr; Back to Interviews
      </Button>
    </div>
  );
}
