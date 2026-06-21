import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import apiClient from '../../api/client';
import type { ApiResponse } from '@placementor/shared';

const QUIZ_CATEGORIES = ['quantitative-aptitude', 'logical-reasoning', 'verbal-ability', 'data-interpretation'];
const TECHNICAL_SUBJECTS = ['c', 'java', 'python', 'dbms', 'computer-networks', 'operating-systems', 'sql', 'cloud-computing'];

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  marks: number;
  difficulty: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  type: string;
  category?: string;
  subject?: string;
  difficulty: string;
  timeLimit: number;
  active: boolean;
  questions: Question[];
}

const emptyQuestion: Question = {
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  marks: 1,
  difficulty: 'easy',
};

function emptyQuiz(): Partial<Quiz> {
  return {
    title: '',
    description: '',
    type: 'aptitude',
    category: QUIZ_CATEGORIES[0],
    subject: TECHNICAL_SUBJECTS[0],
    difficulty: 'easy',
    timeLimit: 10,
    active: true,
    questions: [emptyQuestion],
  };
}

export function AdminQuestionsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Quiz>>(emptyQuiz());
  const [saving, setSaving] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<Quiz[]>>('/quizzes/all');
      setQuizzes(res.data.data || []);
    } catch {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  function openAddForm() {
    setForm(emptyQuiz());
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(quiz: Quiz) {
    setForm({ ...quiz });
    setEditingId(quiz._id);
    setShowForm(true);
  }

  function updateField<K extends keyof Quiz>(key: K, value: Quiz[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateQuestion(index: number, field: keyof Question, value: string | number) {
    const updated = [...(form.questions || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, questions: updated }));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const updated = [...(form.questions || [])];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: opts };
    setForm((prev) => ({ ...prev, questions: updated }));
  }

  function addQuestion() {
    setForm((prev) => ({ ...prev, questions: [...(prev.questions || []), { ...emptyQuestion, options: ['', '', '', ''] }] }));
  }

  function removeQuestion(index: number) {
    setForm((prev) => ({ ...prev, questions: (prev.questions || []).filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.patch(`/quizzes/${editingId}`, form);
      } else {
        await apiClient.post('/quizzes', form);
      }
      setShowForm(false);
      setEditingId(null);
      setLoading(true);
      await fetchQuizzes();
    } catch {
      setError('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await apiClient.delete(`/quizzes/${id}`);
      setLoading(true);
      await fetchQuizzes();
    } catch {
      setError('Failed to delete quiz');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Quiz' : 'Add Quiz'}</h1>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Back</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={form.title || ''} onChange={(e) => updateField('title', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={form.type || 'aptitude'} onChange={(e) => updateField('type', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="aptitude">Aptitude</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              {form.type === 'aptitude' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select value={form.category || QUIZ_CATEGORIES[0]} onChange={(e) => updateField('category', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    {QUIZ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select value={form.subject || TECHNICAL_SUBJECTS[0]} onChange={(e) => updateField('subject', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    {TECHNICAL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select value={form.difficulty || 'easy'} onChange={(e) => updateField('difficulty', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Limit (min)</label>
                <input type="number" value={form.timeLimit || 10} onChange={(e) => updateField('timeLimit', Number(e.target.value))} min={1} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
          </div>

          {(form.questions || []).map((q, qi) => (
            <Card key={qi} title={`Question ${qi + 1}`}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question Text</label>
                  <textarea value={q.questionText} onChange={(e) => updateQuestion(qi, 'questionText', e.target.value)} rows={2} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi}>
                      <label className="block text-sm font-medium text-gray-700">Option {oi + 1}</label>
                      <input type="text" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                    <select value={q.correctAnswer} onChange={(e) => updateQuestion(qi, 'correctAnswer', Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marks</label>
                    <input type="number" value={q.marks} onChange={(e) => updateQuestion(qi, 'marks', Number(e.target.value))} min={1} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select value={q.difficulty} onChange={(e) => updateQuestion(qi, 'difficulty', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Explanation</label>
                  <textarea value={q.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)} rows={2} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                {form.questions!.length > 1 && (
                  <Button type="button" variant="danger" size="sm" onClick={() => removeQuestion(qi)}>Remove</Button>
                )}
              </div>
            </Card>
          ))}

          <div className="flex gap-4">
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'} Quiz</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-500">Manage quizzes and questions</p>
        </div>
        <Button onClick={openAddForm}>+ Add Quiz</Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">No quizzes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category/Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Difficulty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Questions</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{q.title}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{q.type}</td>
                    <td className="px-4 py-3 text-gray-600">{q.category || q.subject || '-'}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{q.difficulty}</td>
                    <td className="px-4 py-3 text-gray-600">{q.questions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${q.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {q.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditForm(q)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(q._id)}>Delete</Button>
                      </div>
                    </td>
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
