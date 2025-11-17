'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface TestFormData {
  title: string;
  description: string;
  type: string;
  totalDuration: number;
  passingScore: number;
  instructions: string;
  tags: string[];
  settings: {
    shuffleQuestions: boolean;
    showTimer: boolean;
    allowPause: boolean;
    showProgressBar: boolean;
    autoSubmitOnTimeout: boolean;
    preventTabSwitch: boolean;
    maxAttempts: number;
  };
}

export default function CreateTestPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    type: 'full_test',
    totalDuration: 170,
    passingScore: 0,
    instructions: '',
    tags: [],
    settings: {
      shuffleQuestions: false,
      showTimer: true,
      allowPause: false,
      showProgressBar: true,
      autoSubmitOnTimeout: true,
      preventTabSwitch: false,
      maxAttempts: 1,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call to create test
      console.log('Creating test:', formData);
      // On success, redirect to test builder
      // router.push(`/${params['org-slug']}/tests/${newTestId}/builder`);
      alert('Test created successfully! (Demo)');
      router.push(`/${params['org-slug']}/tests`);
    } catch (error) {
      console.error('Failed to create test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const updateSettings = (key: string, value: boolean | number) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/${params['org-slug']}/tests`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Tests
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Test</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., IELTS Academic Full Test - January 2025"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Brief description of the test..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Test Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="full_test">Full Test</option>
                    <option value="listening_only">Listening Only</option>
                    <option value="reading_only">Reading Only</option>
                    <option value="writing_only">Writing Only</option>
                    <option value="speaking_only">Speaking Only</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Total Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={240}
                    value={formData.totalDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, totalDuration: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Passing Score (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Leave 0 for no passing score requirement"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="General instructions for students taking this test..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Test Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Timer</div>
                  <div className="text-sm text-gray-600">Display countdown timer to students</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.showTimer}
                    onChange={(e) => updateSettings('showTimer', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Progress Bar</div>
                  <div className="text-sm text-gray-600">Display progress through the test</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.showProgressBar}
                    onChange={(e) => updateSettings('showProgressBar', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Allow Pause</div>
                  <div className="text-sm text-gray-600">
                    Allow students to pause the test (not recommended for timed tests)
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowPause}
                    onChange={(e) => updateSettings('allowPause', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto Submit on Timeout</div>
                  <div className="text-sm text-gray-600">
                    Automatically submit when time runs out
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.autoSubmitOnTimeout}
                    onChange={(e) => updateSettings('autoSubmitOnTimeout', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Shuffle Questions</div>
                  <div className="text-sm text-gray-600">
                    Randomize question order for each student
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.shuffleQuestions}
                    onChange={(e) => updateSettings('shuffleQuestions', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Prevent Tab Switching</div>
                  <div className="text-sm text-gray-600">
                    Warn students when they leave the test window
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.preventTabSwitch}
                    onChange={(e) => updateSettings('preventTabSwitch', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.settings.maxAttempts}
                  onChange={(e) => updateSettings('maxAttempts', parseInt(e.target.value))}
                  className="w-32 rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/${params['org-slug']}/tests`}
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
