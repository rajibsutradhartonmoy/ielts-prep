'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Mock data
const mockData = {
  overview: {
    totalStudents: 156,
    activeStudents: 132,
    totalTeachers: 12,
    totalTests: 45,
    totalAttempts: 892,
    averageBandScore: 6.8,
  },
  recentPerformance: [
    { month: 'Jan', avgScore: 6.2 },
    { month: 'Feb', avgScore: 6.5 },
    { month: 'Mar', avgScore: 6.8 },
    { month: 'Apr', avgScore: 7.0 },
  ],
  bandDistribution: [
    { band: '5.0', count: 15 },
    { band: '5.5', count: 28 },
    { band: '6.0', count: 45 },
    { band: '6.5', count: 62 },
    { band: '7.0', count: 38 },
    { band: '7.5', count: 22 },
    { band: '8.0', count: 8 },
  ],
  topPerformingStudents: [
    { name: 'Alice Johnson', avgScore: 8.5, tests: 5 },
    { name: 'Bob Smith', avgScore: 8.0, tests: 6 },
    { name: 'Carol Davis', avgScore: 7.5, tests: 4 },
  ],
  difficultTests: [
    { name: 'Academic Reading Test 5', avgScore: 5.8, attempts: 45 },
    { name: 'Writing Task 2 - Opinion', avgScore: 6.1, attempts: 38 },
  ],
};

export default function AnalyticsPage() {
  const params = useParams();
  const [dateRange, setDateRange] = useState('month');

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-gray-600">Track performance and generate insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Students</div>
          <div className="mt-2 text-3xl font-bold">{mockData.overview.totalStudents}</div>
          <div className="mt-1 text-sm text-green-600">
            {mockData.overview.activeStudents} active
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Teachers</div>
          <div className="mt-2 text-3xl font-bold">{mockData.overview.totalTeachers}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Test Attempts</div>
          <div className="mt-2 text-3xl font-bold">{mockData.overview.totalAttempts}</div>
          <div className="mt-1 text-sm text-gray-600">
            {mockData.overview.totalTests} tests available
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Average Band Score</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {mockData.overview.averageBandScore}
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 0.3 from last month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Trend */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Performance Trend</h3>
          <div className="space-y-3">
            {mockData.recentPerformance.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-gray-700">{item.month}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${(item.avgScore / 9) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold">{item.avgScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Band Distribution */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Band Score Distribution</h3>
          <div className="space-y-2">
            {mockData.bandDistribution.map((item) => (
              <div key={item.band} className="flex items-center justify-between">
                <span className="w-12 text-gray-700">Band {item.band}</span>
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-6 flex-1 overflow-hidden rounded bg-gray-200">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${(item.count / Math.max(...mockData.bandDistribution.map((d) => d.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Top Performing Students</h3>
          <div className="space-y-3">
            {mockData.topPerformingStudents.map((student, index) => (
              <div key={student.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : index === 1
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.tests} tests</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">{student.avgScore}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficult Tests */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Tests Needing Attention</h3>
          <div className="space-y-3">
            {mockData.difficultTests.map((test) => (
              <div key={test.name} className="rounded-lg border p-3">
                <div className="font-medium">{test.name}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{test.attempts} attempts</span>
                  <span className="font-semibold text-red-600">
                    Avg: {test.avgScore}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Consider reviewing question difficulty or providing additional resources
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button className="rounded-lg bg-white px-4 py-3 text-left shadow hover:shadow-md">
            <div className="font-medium">Export Student Performance</div>
            <div className="text-sm text-gray-600">Download detailed report (CSV)</div>
          </button>
          <button className="rounded-lg bg-white px-4 py-3 text-left shadow hover:shadow-md">
            <div className="font-medium">Test Analytics Report</div>
            <div className="text-sm text-gray-600">View question-level insights</div>
          </button>
          <button className="rounded-lg bg-white px-4 py-3 text-left shadow hover:shadow-md">
            <div className="font-medium">Teacher Performance</div>
            <div className="text-sm text-gray-600">Review grading statistics</div>
          </button>
        </div>
      </div>
    </div>
  );
}
