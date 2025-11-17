'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeacherDashboard() {
  const stats = {
    myStudents: 25,
    pendingGradings: 8,
    testsGradedThisWeek: 15,
    myBatches: 2,
  };

  const pendingGradings = [
    { id: 1, student: 'John Doe', type: 'Speaking', submittedAt: '2 hours ago' },
    { id: 2, student: 'Jane Smith', type: 'Writing', submittedAt: '3 hours ago' },
    { id: 3, student: 'Bob Wilson', type: 'Speaking', submittedAt: '5 hours ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Gradings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingGradings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Graded This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testsGradedThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myBatches}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Gradings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingGradings.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{item.student}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.type} - Submitted {item.submittedAt}
                  </p>
                </div>
                <Button size="sm">Grade Now</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
