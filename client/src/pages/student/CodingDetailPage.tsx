import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getChallengeById, submitSolution } from '../../api/coding';
import type { ICodingChallenge, ICodingSubmission } from '@placementor/shared';

const languages = ['javascript', 'python', 'java'];

export function CodingDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [challenge, setChallenge] = useState<ICodingChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<ICodingSubmission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    getChallengeById(challengeId)
      .then((data) => {
        setChallenge(data);
        setCode(data.sampleInput ? `// Write your solution here\n` : '');
      })
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load challenge'))
      .finally(() => setLoading(false));
  }, [challengeId]);

  const handleSubmit = async () => {
    if (!challengeId || !code.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmission(null);
    try {
      const result = await submitSolution(challengeId, code, language);
      setSubmission(result);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setSubmitError(axiosErr.response?.data?.error || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Coding Challenge</h1>
        <Card>
          <p className="text-red-600">{error || 'Challenge not found'}</p>
        </Card>
      </div>
    );
  }

  const totalTests = challenge.testCases.length;
  const passedTests = submission?.passedTestCases ?? 0;
  const submissionStatus = submission?.status;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">{challenge.difficulty} difficulty</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            challenge.difficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : challenge.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {challenge.difficulty}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card title="Problem Statement">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {challenge.problemStatement}
            </p>
          </Card>

          {challenge.constraints && (
            <Card title="Constraints">
              <p className="text-sm text-gray-700 whitespace-pre-line">{challenge.constraints}</p>
            </Card>
          )}

          {(challenge.sampleInput || challenge.sampleOutput) && (
            <Card title="Sample">
              <div className="space-y-3">
                {challenge.sampleInput && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Input</p>
                    <pre className="rounded-lg bg-gray-50 p-3 text-sm">{challenge.sampleInput}</pre>
                  </div>
                )}
                {challenge.sampleOutput && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Output</p>
                    <pre className="rounded-lg bg-gray-50 p-3 text-sm">{challenge.sampleOutput}</pre>
                  </div>
                )}
              </div>
            </Card>
          )}

          {challenge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {challenge.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Solution">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label htmlFor="language" className="text-sm font-medium text-gray-700">
                  Language:
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Write your code here..."
                spellCheck={false}
              />

              <Button onClick={handleSubmit} loading={submitting} disabled={!code.trim()}>
                Submit Solution
              </Button>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            </div>
          </Card>

          {submission && (
            <Card title="Result">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      submissionStatus === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : submissionStatus === 'incorrect'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {submissionStatus === 'correct'
                      ? 'Accepted'
                      : submissionStatus === 'incorrect'
                        ? 'Failed'
                        : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  Test cases passed: {passedTests} / {totalTests}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      passedTests === totalTests ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
