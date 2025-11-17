'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'features'>('general');

  const [generalSettings, setGeneralSettings] = useState({
    name: 'IELTS Excellence Academy',
    email: 'contact@ieltsexcellence.com',
    phone: '+1 234 567 8900',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    logoUrl: '',
    faviconUrl: '',
  });

  const [features, setFeatures] = useState({
    studentSelfRegistration: true,
    batchManagement: true,
    advancedAnalytics: true,
    customBranding: true,
    apiAccess: false,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-1 text-gray-600">Manage your organization's configuration</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('general')}
          className={`border-b-2 px-4 py-2 ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`border-b-2 px-4 py-2 ${
            activeTab === 'branding'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Branding
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`border-b-2 px-4 py-2 ${
            activeTab === 'features'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Features
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Organization Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={generalSettings.name}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={generalSettings.phone}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Regional Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Chicago">Central Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, language: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Branding Settings */}
      {activeTab === 'branding' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Brand Colors</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={brandingSettings.primaryColor}
                    onChange={(e) =>
                      setBrandingSettings({
                        ...brandingSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={brandingSettings.secondaryColor}
                    onChange={(e) =>
                      setBrandingSettings({
                        ...brandingSettings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={brandingSettings.accentColor}
                    onChange={(e) =>
                      setBrandingSettings({
                        ...brandingSettings,
                        accentColor: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Logo & Assets</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Organization Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    {brandingSettings.logoUrl ? (
                      <img src={brandingSettings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-gray-400">No logo</span>
                    )}
                  </div>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                    Upload Logo
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    {brandingSettings.faviconUrl ? (
                      <img src={brandingSettings.faviconUrl} alt="Favicon" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400">No icon</span>
                    )}
                  </div>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                    Upload Favicon
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Typography</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Font Family
              </label>
              <select
                value={brandingSettings.fontFamily}
                onChange={(e) =>
                  setBrandingSettings({
                    ...brandingSettings,
                    fontFamily: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Save Branding
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      {activeTab === 'features' && (
        <div className="max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Enabled Features</h2>
            <div className="space-y-4">
              {Object.entries(features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {key === 'studentSelfRegistration' && 'Allow students to register themselves'}
                      {key === 'batchManagement' && 'Organize students into batches'}
                      {key === 'advancedAnalytics' && 'Access detailed analytics and reports'}
                      {key === 'customBranding' && 'Customize platform appearance'}
                      {key === 'apiAccess' && 'Integrate with external systems'}
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setFeatures({ ...features, [key]: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                Save Features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
