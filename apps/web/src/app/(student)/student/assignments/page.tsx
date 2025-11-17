'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Assignment {
  id: string;
  testTitle: string;
  testType: string;
  startDate: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'past';
  attempts: number;
  maxAttempts: number;
  lastAttemptScore?: number;
}

// Mock data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    testTitle: 'IELTS Academic Full Test - January 2025',
    testType: 'full_test',
    startDate: '2025-01-20T00:00:00Z',
    dueDate: '2025-01-27T23:59:59Z',
    status: 'active',
    attempts: 0,
    maxAttempts: 1,
  },
  {
    id: '2',
    testTitle: 'Speaking Practice Test',
    testType: 'speaking_only',
    startDate: '2025-01-22T00:00:00Z',
    dueDate: '2025-01-29T23:59:59Z',
    status: 'active',
    attempts: 1,
    maxAttempts: 2,
    lastAttemptScore: 7.5,
  },
  {
    id: '3',
    testTitle: 'Writing Task 2 Practice',
    testType: 'writing_only',
    startDate: '2025-01-10T00:00:00Z',
    dueDate: '2025-01-17T23:59:59Z',
    status: 'past',
    attempts: 1,
    maxAttempts: 1,
    lastAttemptScore: 6.5,
  },
];

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  past: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  upcoming: 'Upcoming',
  active: 'Active',
  past: 'Completed',
};

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'past'>('all');

  const filteredAssignments = mockAssignments.filter(
    (a) => filter === 'all' || a.status === filter
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Test Assignments</h1>
        <p className="mt-1 text-gray-600">View and take your assigned tests</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Active Assignments</div>
          <div className="text-2xl font-bold text-green-600">
            {mockAssignments.filter((a) => a.status === 'active').length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Upcoming</div>
          <div className="text-2xl font-bold text-blue-600">
            {mockAssignments.filter((a) => a.status === 'upcoming').length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-600">
            {mockAssignments.filter((a) => a.status === 'past').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-4 py-2 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`rounded px-4 py-2 ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`rounded px-4 py-2 ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`rounded px-4 py-2 ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completed
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{assignment.testTitle}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[assignment.status]}`}
                  >
                    {statusLabels[assignment.status]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    Start: {new Date(assignment.startDate).toLocaleDateString()}
                  </span>
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>
                    Attempts: {assignment.attempts}/{assignment.maxAttempts}
                  </span>
                  {assignment.lastAttemptScore && (
                    <span className="font-medium text-blue-600">
                      Last Score: {assignment.lastAttemptScore}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {assignment.status === 'active' &&
                  assignment.attempts < assignment.maxAttempts && (
                    <Link
                      href={`/student/assignments/${assignment.id}/take`}
                      className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                    >
                      {assignment.attempts > 0 ? 'Retake Test' : 'Start Test'}
                    </Link>
                  )}
                {assignment.attempts > 0 && (
                  <Link
                    href={`/student/assignments/${assignment.id}/results`}
                    className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
                  >
                    View Results
                  </Link>
                )}
              </div>
            </div>

            {assignment.status === 'active' && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">Time remaining</div>
                <div className="mt-1 text-lg font-semibold text-red-600">
                  {Math.ceil(
                    (new Date(assignment.dueDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No {filter !== 'all' && filter} assignments found
        </div>
      )}
    </div>
  );
}
