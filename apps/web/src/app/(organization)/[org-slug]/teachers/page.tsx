'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Teacher {
  id: string;
  teacherCode: string;
  specialization: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
}

export default function TeachersPage({ params }: { params: { 'org-slug': string } }) {
  const [search, setSearch] = useState('');

  const teachers: Teacher[] = [
    {
      id: '1',
      teacherCode: 'TCH-001',
      specialization: 'speaking',
      user: { name: 'Jane Teacher', email: 'jane.t@example.com' },
      status: 'active',
    },
    {
      id: '2',
      teacherCode: 'TCH-002',
      specialization: 'writing',
      user: { name: 'Mark Expert', email: 'mark.e@example.com' },
      status: 'active',
    },
    {
      id: '3',
      teacherCode: 'TCH-003',
      specialization: 'both',
      user: { name: 'Sarah Pro', email: 'sarah.p@example.com' },
      status: 'active',
    },
  ];

  const filteredTeachers = teachers.filter(
    (t) =>
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage teachers and their assignments</p>
        </div>
        <Button>Add Teacher</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher List ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mb-4"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{teacher.user.name}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {teacher.specialization}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
                    <p className="text-xs font-mono">{teacher.teacherCode}</p>
                    <div className="pt-2 space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
