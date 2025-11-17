'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GradingQueueItem {
  id: string;
  studentName: string;
  testTitle: string;
  questionType: 'writing_task' | 'speaking_task';
  submittedAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

// Mock data
const mockGradingQueue: GradingQueueItem[] = [
  {
    id: '1',
    studentName: 'Alice Johnson',
    testTitle: 'IELTS Writing Task 2',
    questionType: 'writing_task',
    submittedAt: '2025-01-20T10:30:00Z',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-01-22T23:59:59Z',
  },
  {
    id: '2',
    studentName: 'Bob Smith',
    testTitle: 'Speaking Part 2',
    questionType: 'speaking_task',
    submittedAt: '2025-01-20T14:15:00Z',
    priority: 'normal',
    status: 'pending',
  },
  {
    id: '3',
    studentName: 'Carol Davis',
    testTitle: 'IELTS Writing Task 1',
    questionType: 'writing_task',
    submittedAt: '2025-01-19T16:45:00Z',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2025-01-21T23:59:59Z',
  },
  {
    id: '4',
    studentName: 'David Wilson',
    testTitle: 'Speaking Part 3',
    questionType: 'speaking_task',
    submittedAt: '2025-01-18T11:20:00Z',
    priority: 'normal',
    status: 'completed',
  },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const questionTypeIcons = {
  writing_task: '✍️',
  speaking_task: '🎤',
};

export default function TeacherGradingPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');

  const filteredItems = mockGradingQueue.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter
  );

  const pendingCount = mockGradingQueue.filter((i) => i.status === 'pending').length;
  const inProgressCount = mockGradingQueue.filter((i) => i.status === 'in_progress').length;
  const completedToday = mockGradingQueue.filter((i) => i.status === 'completed').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grading Queue</h1>
        <p className="mt-1 text-gray-600">Review and grade student submissions</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Completed Today</div>
          <div className="text-2xl font-bold text-green-600">{completedToday}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-600">Avg. Grading Time</div>
          <div className="text-2xl font-bold text-gray-900">8 min</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`rounded px-4 py-2 ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`rounded px-4 py-2 ${statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`rounded px-4 py-2 ${statusFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded px-4 py-2 ${statusFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </button>
      </div>

      {/* Grading Queue */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-1 items-start gap-4">
                <div className="text-3xl">{questionTypeIcons[item.questionType]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.studentName}</h3>
                    <span className="text-sm text-gray-600">• {item.testTitle}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>
                      Submitted: {new Date(item.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(item.submittedAt).toLocaleTimeString()}
                    </span>
                    {item.dueDate && (
                      <span className="font-medium text-red-600">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${priorityColors[item.priority]}`}
                    >
                      {item.priority.toUpperCase()}
                    </span>
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusColors[item.status]}`}
                    >
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {item.status === 'pending' && (
                  <Link
                    href={`/teacher/grading/${item.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Start Grading
                  </Link>
                )}
                {item.status === 'in_progress' && (
                  <Link
                    href={`/teacher/grading/${item.id}`}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Continue
                  </Link>
                )}
                {item.status === 'completed' && (
                  <Link
                    href={`/teacher/grading/${item.id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="mt-12 rounded-lg bg-gray-50 p-12 text-center">
          <div className="text-6xl">🎉</div>
          <div className="mt-4 text-lg font-semibold text-gray-900">
            No {statusFilter !== 'all' && statusFilter} items
          </div>
          <div className="mt-1 text-gray-600">
            {statusFilter === 'pending'
              ? 'Great job! You have no pending submissions to grade.'
              : `No ${statusFilter} items found.`}
          </div>
        </div>
      )}
    </div>
  );
}
