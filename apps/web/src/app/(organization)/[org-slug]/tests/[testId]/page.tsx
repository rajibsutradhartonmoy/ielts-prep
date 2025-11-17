'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// Mock data
const mockTest = {
  id: '1',
  title: 'IELTS Academic Full Test - January 2025',
  description: 'Complete IELTS Academic test with all four sections.',
  type: 'full_test',
  status: 'draft',
  totalDuration: 170,
  totalQuestions: 80,
  passingScore: 0,
  instructions: 'This is a complete IELTS Academic test. Please ensure you have a quiet environment and stable internet connection before starting.',
  tags: ['academic', 'full-test', '2025'],
  settings: {
    shuffleQuestions: false,
    showTimer: true,
    allowPause: false,
    showProgressBar: true,
    autoSubmitOnTimeout: true,
    preventTabSwitch: true,
    maxAttempts: 1,
  },
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-20T14:30:00Z',
  sections: [
    {
      id: 's1',
      type: 'listening',
      title: 'Listening Section',
      duration: 30,
      totalQuestions: 40,
    },
    {
      id: 's2',
      type: 'reading',
      title: 'Reading Section',
      duration: 60,
      totalQuestions: 40,
    },
    {
      id: 's3',
      type: 'writing',
      title: 'Writing Section',
      duration: 60,
      totalQuestions: 2,
    },
    {
      id: 's4',
      type: 'speaking',
      title: 'Speaking Section',
      duration: 15,
      totalQuestions: 3,
    },
  ],
};

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

const typeLabels: Record<string, string> = {
  full_test: 'Full Test',
  speaking_only: 'Speaking Only',
  writing_only: 'Writing Only',
  listening_only: 'Listening Only',
  reading_only: 'Reading Only',
};

const sectionIcons: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🎤',
};

export default function TestDetailPage() {
  const params = useParams();
  const test = mockTest;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/${params['org-slug']}/tests`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Tests
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColors[test.status]}`}
                >
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{test.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {test.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {test.status === 'draft' && (
                <>
                  <Link
                    href={`/${params['org-slug']}/tests/${test.id}/builder`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Edit Test
                  </Link>
                  <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Publish
                  </button>
                </>
              )}
              {test.status === 'published' && (
                <button className="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
                  Archive
                </button>
              )}
              <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                Clone
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Type</div>
            <div className="text-lg font-semibold">{typeLabels[test.type]}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Duration</div>
            <div className="text-lg font-semibold">{test.totalDuration} minutes</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-lg font-semibold">{test.totalQuestions}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Sections</div>
            <div className="text-lg font-semibold">{test.sections.length}</div>
          </div>
        </div>

        {/* Sections Overview */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Test Sections</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {test.sections.map((section) => (
              <div key={section.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sectionIcons[section.type]}</span>
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-600">
                      {section.duration} min • {section.totalQuestions} questions
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Settings */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Test Settings</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded border p-3">
              <span>Show Timer</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.showTimer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.showTimer ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Show Progress Bar</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.showProgressBar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.showProgressBar ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Allow Pause</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.allowPause ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.allowPause ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Auto Submit on Timeout</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.autoSubmitOnTimeout ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.autoSubmitOnTimeout ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Shuffle Questions</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.shuffleQuestions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.shuffleQuestions ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Prevent Tab Switch</span>
              <span
                className={`rounded px-2 py-1 text-sm ${test.settings.preventTabSwitch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {test.settings.preventTabSwitch ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Maximum Attempts</span>
              <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                {test.settings.maxAttempts}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <span>Passing Score</span>
              <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                {test.passingScore > 0 ? `${test.passingScore}%` : 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {test.instructions && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Instructions</h2>
            <div className="whitespace-pre-wrap text-gray-700">{test.instructions}</div>
          </div>
        )}
      </div>
    </div>
  );
}
