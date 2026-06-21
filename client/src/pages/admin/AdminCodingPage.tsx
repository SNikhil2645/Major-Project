import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import apiClient from '../../api/client';
import type { ApiResponse } from '@placementor/shared';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  problemStatement: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  difficulty: string;
  tags: string[];
  testCases: TestCase[];
  active: boolean;
}

const emptyTestCase = (): TestCase => ({ input: '', expectedOutput: '', isHidden: false });

function emptyChallenge(): Partial<Challenge> {
  return {
    title: '',
    description: '',
    problemStatement: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    difficulty: 'easy',
    tags: [],
    testCases: [emptyTestCase()],
    active: true,
  };
}

export function AdminCodingPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Challenge>>(emptyChallenge());
  const [saving, setSaving] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<Challenge[]>>('/coding/all');
      setChallenges(res.data.data || []);
    } catch {
      setError('Failed to load coding challenges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  function openAddForm() {
    setForm(emptyChallenge());
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(c: Challenge) {
    setForm({ ...c, tags: [...c.tags] });
    setEditingId(c._id);
    setShowForm(true);
  }

  function updateField<K extends keyof Challenge>(key: K, value: Challenge[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTestCase(index: number, field: keyof TestCase, value: string | boolean) {
    const updated = [...(form.testCases || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, testCases: updated }));
  }

  function addTestCase() {
    setForm((prev) => ({ ...prev, testCases: [...(prev.testCases || []), emptyTestCase()] }));
  }

  function removeTestCase(index: number) {
    setForm((prev) => ({ ...prev, testCases: (prev.testCases || []).filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.patch(`/coding/${editingId}`, form);
      } else {
        await apiClient.post('/coding', form);
      }
      setShowForm(false);
      setEditingId(null);
      setLoading(true);
      await fetchChallenges();
    } catch {
      setError('Failed to save challenge');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      await apiClient.delete(`/coding/${id}`);
      setLoading(true);
      await fetchChallenges();
    } catch {
      setError('Failed to delete challenge');
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
          <h1 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Challenge' : 'Add Challenge'}</h1>
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
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select value={form.difficulty || 'easy'} onChange={(e) => updateField('difficulty', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <input type="text" value={(form.tags || []).join(', ')} onChange={(e) => updateField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="active" checked={form.active ?? true} onChange={(e) => updateField('active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={2} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Problem Statement</label>
              <textarea value={form.problemStatement || ''} onChange={(e) => updateField('problemStatement', e.target.value)} rows={6} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Constraints</label>
                <textarea value={form.constraints || ''} onChange={(e) => updateField('constraints', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sample Input</label>
                  <textarea value={form.sampleInput || ''} onChange={(e) => updateField('sampleInput', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sample Output</label>
                  <textarea value={form.sampleOutput || ''} onChange={(e) => updateField('sampleOutput', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Test Cases</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTestCase}>+ Add Test Case</Button>
          </div>

          {(form.testCases || []).map((tc, i) => (
            <Card key={i} title={`Test Case ${i + 1}`}>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Input</label>
                    <textarea value={tc.input} onChange={(e) => updateTestCase(i, 'input', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Output</label>
                    <textarea value={tc.expectedOutput} onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`hidden-${i}`} checked={tc.isHidden} onChange={(e) => updateTestCase(i, 'isHidden', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <label htmlFor={`hidden-${i}`} className="text-sm font-medium text-gray-700">Hidden</label>
                  </div>
                  {form.testCases!.length > 1 && (
                    <Button type="button" variant="danger" size="sm" onClick={() => removeTestCase(i)}>Remove</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-4">
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'} Challenge</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Coding Challenges</h1>
          <p className="text-gray-500">Manage coding challenges and test cases</p>
        </div>
        <Button onClick={openAddForm}>+ Add Challenge</Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        {challenges.length === 0 ? (
          <p className="text-sm text-gray-500">No challenges yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Difficulty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tags</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Test Cases</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {challenges.map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.difficulty}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.tags || []).join(', ') || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.testCases?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditForm(c)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(c._id)}>Delete</Button>
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
