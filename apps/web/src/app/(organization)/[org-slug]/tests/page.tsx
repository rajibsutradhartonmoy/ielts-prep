'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Test {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  totalDuration: number;
  totalQuestions: number;
  createdAt: string;
  tags: string[];
}

// Mock data - replace with actual API calls
const mockTests: Test[] = [
  {
    id: '1',
    title: 'IELTS Academic Full Test - January 2025',
    type: 'full_test',
    status: 'published',
    totalDuration: 170,
    totalQuestions: 80,
    createdAt: '2025-01-15T10:00:00Z',
    tags: ['academic', 'full-test'],
  },
  {
    id: '2',
    title: 'Speaking Practice Test - Interview Skills',
    type: 'speaking_only',
    status: 'draft',
    totalDuration: 15,
    totalQuestions: 3,
    createdAt: '2025-01-20T14:30:00Z',
    tags: ['speaking', 'interview'],
  },
  {
    id: '3',
    title: 'Writing Task 2 - Opinion Essays',
    type: 'writing_only',
    status: 'published',
    totalDuration: 40,
    totalQuestions: 1,
    createdAt: '2025-01-18T09:15:00Z',
    tags: ['writing', 'task2', 'opinion'],
  },
];

const statusColors = {
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

export default function TestsPage() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTests = mockTests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesType = typeFilter === 'all' || test.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
          <p className="mt-1 text-gray-600">Create and manage IELTS practice tests</p>
        </div>
        <Link
          href={`/${params['org-slug']}/tests/create`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Test
        </Link>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Total Tests</div>
          <div className="text-2xl font-bold">{mockTests.length}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {mockTests.filter((t) => t.status === 'published').length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">
            {mockTests.filter((t) => t.status === 'draft').length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Archived</div>
          <div className="text-2xl font-bold text-gray-600">
            {mockTests.filter((t) => t.status === 'archived').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="all">All Types</option>
          <option value="full_test">Full Test</option>
          <option value="speaking_only">Speaking Only</option>
          <option value="writing_only">Writing Only</option>
          <option value="listening_only">Listening Only</option>
          <option value="reading_only">Reading Only</option>
        </select>
      </div>

      {/* Tests Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Test
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-medium text-gray-900">{test.title}</div>
                  <div className="mt-1 flex gap-1">
                    {test.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {typeLabels[test.type]}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[test.status]}`}
                  >
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {test.totalDuration} min
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {test.totalQuestions}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <Link
                      href={`/${params['org-slug']}/tests/${test.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {test.status === 'draft' && (
                      <Link
                        href={`/${params['org-slug']}/tests/${test.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                    )}
                    <button className="text-purple-600 hover:text-purple-900">Clone</button>
                    {test.status === 'draft' && (
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTests.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No tests found matching your criteria
        </div>
      )}
    </div>
  );
}
