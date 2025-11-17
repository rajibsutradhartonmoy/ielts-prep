'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  type: string;
  questionText: string;
  orderIndex: number;
  points: number;
}

interface Section {
  id: string;
  type: string;
  title: string;
  duration: number;
  orderIndex: number;
  questions: Question[];
}

// Mock data
const mockTest = {
  id: '1',
  title: 'IELTS Academic Full Test - January 2025',
  type: 'full_test',
  status: 'draft',
  totalDuration: 170,
  sections: [
    {
      id: 's1',
      type: 'listening',
      title: 'Listening Section',
      duration: 30,
      orderIndex: 0,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          questionText: 'What time does the meeting start?',
          orderIndex: 0,
          points: 1,
        },
        {
          id: 'q2',
          type: 'fill_blank',
          questionText: 'The conference will be held at _____.',
          orderIndex: 1,
          points: 1,
        },
      ],
    },
    {
      id: 's2',
      type: 'reading',
      title: 'Reading Section',
      duration: 60,
      orderIndex: 1,
      questions: [],
    },
  ] as Section[],
};

const sectionTypes = [
  { value: 'listening', label: 'Listening', icon: '🎧' },
  { value: 'reading', label: 'Reading', icon: '📖' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'speaking', label: 'Speaking', icon: '🎤' },
];

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false_not_given', label: 'True/False/Not Given' },
  { value: 'matching', label: 'Matching' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'sentence_completion', label: 'Sentence Completion' },
  { value: 'summary_completion', label: 'Summary Completion' },
  { value: 'diagram_labeling', label: 'Diagram Labeling' },
  { value: 'writing_task', label: 'Writing Task' },
  { value: 'speaking_task', label: 'Speaking Task' },
];

export default function TestBuilderPage() {
  const params = useParams();
  const [test, setTest] = useState(mockTest);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  const [newSection, setNewSection] = useState({
    type: 'listening',
    title: '',
    duration: 30,
  });

  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple_choice',
    questionText: '',
    points: 1,
  });

  const addSection = () => {
    const section: Section = {
      id: `s${Date.now()}`,
      type: newSection.type,
      title: newSection.title || `${newSection.type.charAt(0).toUpperCase() + newSection.type.slice(1)} Section`,
      duration: newSection.duration,
      orderIndex: test.sections.length,
      questions: [],
    };

    setTest({
      ...test,
      sections: [...test.sections, section],
    });

    setShowAddSectionModal(false);
    setNewSection({ type: 'listening', title: '', duration: 30 });
  };

  const addQuestion = () => {
    if (!selectedSection) return;

    const section = test.sections.find((s) => s.id === selectedSection);
    if (!section) return;

    const question: Question = {
      id: `q${Date.now()}`,
      type: newQuestion.type,
      questionText: newQuestion.questionText,
      orderIndex: section.questions.length,
      points: newQuestion.points,
    };

    setTest({
      ...test,
      sections: test.sections.map((s) =>
        s.id === selectedSection ? { ...s, questions: [...s.questions, question] } : s
      ),
    });

    setShowAddQuestionModal(false);
    setNewQuestion({ type: 'multiple_choice', questionText: '', points: 1 });
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section and all its questions?')) {
      setTest({
        ...test,
        sections: test.sections.filter((s) => s.id !== sectionId),
      });
      if (selectedSection === sectionId) {
        setSelectedSection(null);
      }
    }
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setTest({
        ...test,
        sections: test.sections.map((s) =>
          s.id === sectionId
            ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
            : s
        ),
      });
    }
  };

  const totalQuestions = test.sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${params['org-slug']}/tests`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-xl font-bold">{test.title}</h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{test.sections.length} sections</span>
                <span>{totalQuestions} questions</span>
                <span>{test.totalDuration} min total</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
              Preview
            </button>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Publish Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sections Sidebar */}
        <div className="w-80 overflow-y-auto border-r bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Sections</h2>
            <button
              onClick={() => setShowAddSectionModal(true)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {test.sections.map((section) => (
              <div
                key={section.id}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedSection === section.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{sectionTypes.find((t) => t.value === section.type)?.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(section.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {section.duration} min • {section.questions.length} questions
                </div>
              </div>
            ))}
          </div>

          {test.sections.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              No sections yet. Add a section to get started.
            </div>
          )}
        </div>

        {/* Questions Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedSection ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {test.sections.find((s) => s.id === selectedSection)?.title} - Questions
                </h2>
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  + Add Question
                </button>
              </div>

              <div className="space-y-4">
                {test.sections
                  .find((s) => s.id === selectedSection)
                  ?.questions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border bg-white p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium">
                              Q{index + 1}
                            </span>
                            <span className="text-sm text-gray-600">
                              {questionTypes.find((t) => t.value === question.type)?.label}
                            </span>
                            <span className="text-sm text-blue-600">
                              {question.points} {question.points === 1 ? 'point' : 'points'}
                            </span>
                          </div>
                          <p className="text-gray-900">{question.questionText}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button
                            onClick={() => deleteQuestion(selectedSection, question.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {test.sections.find((s) => s.id === selectedSection)?.questions.length === 0 && (
                <div className="mt-12 text-center text-gray-500">
                  No questions in this section. Click "Add Question" to add one.
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a section from the left to view and manage its questions
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Add Section</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Section Type</label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="w-full rounded border p-2"
                >
                  {sectionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Title (optional)</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="w-full rounded border p-2"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newSection.duration}
                  onChange={(e) =>
                    setNewSection({ ...newSection, duration: parseInt(e.target.value) })
                  }
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="rounded border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addSection}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Add Question</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Question Type</label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  className="w-full rounded border p-2"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Question Text</label>
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, questionText: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded border p-2"
                  placeholder="Enter the question text..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Points</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newQuestion.points}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })
                  }
                  className="w-32 rounded border p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="rounded border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addQuestion}
                disabled={!newQuestion.questionText.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
