import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { listResources } from '../../api/resource';
import type { IResource } from '@placementor/shared';

const CATEGORIES = ['All', 'Aptitude', 'Technical', 'Resume', 'Interview', 'Coding', 'Soft Skills'];

const MIME_ICONS: Record<string, string> = {
  'application/pdf': '📕',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📙',
  'text/plain': '📄',
  'video/mp4': '🎬',
  'video/webm': '🎬',
};

function getFileIcon(mimeType: string): string {
  return MIME_ICONS[mimeType] ?? '📄';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function ResourcesPage() {
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    listResources(activeCategory === 'All' ? undefined : activeCategory)
      .then((res) => setResources(res.data))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Learning Resources</h1>
      <p className="text-gray-500">Browse and download study materials, templates, and more.</p>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-center text-sm text-red-500">{error}</p>
      ) : resources.length === 0 ? (
        <p className="text-center text-sm text-gray-500">No resources found for this category.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource._id}>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getFileIcon(resource.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{resource.title}</h3>
                    {resource.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{resource.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatFileSize(resource.fileSize)}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(resource.fileUrl, '_blank', 'noopener,noreferrer')}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
