'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Student {
  id: string;
  studentCode: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
  enrollmentDate: string;
}

export default function StudentsPage({ params }: { params: { 'org-slug': string } }) {
  const [search, setSearch] = useState('');

  // Mock data - will be fetched from API
  const students: Student[] = [
    {
      id: '1',
      studentCode: 'STU-ABC123',
      user: { name: 'John Doe', email: 'john@example.com' },
      status: 'active',
      enrollmentDate: '2024-01-15',
    },
    {
      id: '2',
      studentCode: 'STU-DEF456',
      user: { name: 'Jane Smith', email: 'jane@example.com' },
      status: 'active',
      enrollmentDate: '2024-01-20',
    },
    {
      id: '3',
      studentCode: 'STU-GHI789',
      user: { name: 'Bob Wilson', email: 'bob@example.com' },
      status: 'inactive',
      enrollmentDate: '2024-02-01',
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage students for {params['org-slug']}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import CSV</Button>
          <Button>Add Student</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Total: {filteredStudents.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by name, email, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Code</th>
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Enrolled</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-3 font-mono text-sm">{student.studentCode}</td>
                      <td className="p-3">{student.user.name}</td>
                      <td className="p-3 text-muted-foreground">{student.user.email}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            student.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {student.enrollmentDate}
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
