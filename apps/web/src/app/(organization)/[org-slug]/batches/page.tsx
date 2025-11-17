'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Batch {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  studentCount: number;
  teacherCount: number;
}

export default function BatchesPage({ params }: { params: { 'org-slug': string } }) {
  const batches: Batch[] = [
    {
      id: '1',
      name: 'January 2024 Morning Batch',
      description: 'Advanced level students preparing for March exam',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      status: 'active',
      studentCount: 15,
      teacherCount: 2,
    },
    {
      id: '2',
      name: 'February 2024 Evening Batch',
      description: 'Intermediate level students',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      status: 'active',
      studentCount: 20,
      teacherCount: 3,
    },
    {
      id: '3',
      name: 'December 2023 Batch',
      description: 'Completed batch',
      startDate: '2023-12-01',
      endDate: '2024-01-31',
      status: 'completed',
      studentCount: 18,
      teacherCount: 2,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Batches</h1>
          <p className="text-muted-foreground">Organize students and teachers into batches</p>
        </div>
        <Button>Create Batch</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{batch.name}</CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    batch.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : batch.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {batch.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{batch.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span className="font-medium">{batch.studentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Teachers:</span>
                  <span className="font-medium">{batch.teacherCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start:</span>
                  <span className="font-medium">{batch.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>End:</span>
                  <span className="font-medium">{batch.endDate}</span>
                </div>
              </div>

              <div className="mt-4 space-x-2">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
