'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const stats = {
    assignedTests: 5,
    completedTests: 12,
    pendingTests: 2,
    averageScore: 7.5,
  };

  const upcomingTests = [
    { id: 1, name: 'Full IELTS Mock Test', dueDate: '2024-03-20', type: 'Full Test' },
    { id: 2, name: 'Speaking Practice', dueDate: '2024-03-18', type: 'Speaking Only' },
  ];

  const recentResults = [
    { id: 1, name: 'Writing Task 2', date: '2024-03-10', score: 7.0 },
    { id: 2, name: 'Listening Practice', date: '2024-03-08', score: 8.0 },
    { id: 3, name: 'Reading Comprehension', date: '2024-03-05', score: 7.5 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Band Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTests.map((test) => (
                <div key={test.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {test.type} - Due: {test.dueDate}
                    </p>
                  </div>
                  <Button size="sm">Start Test</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{result.score}</p>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
