/**
 * System Settings Client Component
 * 
 * Displays and manages platform settings and feature flags.
 */

'use client';

import { useState, useEffect } from 'react';
import { SettingCard } from './SettingCard';

interface Setting {
  value: unknown;
  description: string | null;
  updated_at: string;
}

interface SettingsData {
  [key: string]: Setting;
}

export function SystemSettingsClient() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: unknown) => {
    try {
      setSaving(key);
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update setting');
        return;
      }

      // Refresh settings
      await fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700/50 rounded-lg animate-pulse w-64" />
        <div className="h-96 bg-gray-800/80 rounded-2xl border border-gray-700/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-sm text-gray-400 mt-1">
          Configure platform settings and feature flags
        </p>
      </div>

      {/* Maintenance Mode */}
      {settings.maintenance_mode && (
        <SettingCard
          title="Maintenance Mode"
          description={settings.maintenance_mode.description || 'Enable maintenance mode to temporarily disable the platform'}
          setting={settings.maintenance_mode}
          onUpdate={(value) => updateSetting('maintenance_mode', value)}
          saving={saving === 'maintenance_mode'}
          type="object"
        />
      )}

      {/* Feature Flags */}
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Feature Flags</h3>
        <div className="space-y-4">
          {settings.feature_comments && (
            <SettingCard
              title="Comments Feature"
              description={settings.feature_comments.description || 'Enable/disable comments on stories'}
              setting={settings.feature_comments}
              onUpdate={(value) => updateSetting('feature_comments', value)}
              saving={saving === 'feature_comments'}
              type="boolean"
            />
          )}
          {settings.feature_stories && (
            <SettingCard
              title="Story Creation"
              description={settings.feature_stories.description || 'Enable/disable story creation by users'}
              setting={settings.feature_stories}
              onUpdate={(value) => updateSetting('feature_stories', value)}
              saving={saving === 'feature_stories'}
              type="boolean"
            />
          )}
        </div>
      </div>

      {/* Platform Configuration */}
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Platform Configuration</h3>
        <div className="space-y-4">
          {settings.max_story_depth && (
            <SettingCard
              title="Max Story Depth"
              description={settings.max_story_depth.description || 'Maximum depth for branching stories'}
              setting={settings.max_story_depth}
              onUpdate={(value) => updateSetting('max_story_depth', value)}
              saving={saving === 'max_story_depth'}
              type="number"
            />
          )}
          {settings.max_stories_per_user && (
            <SettingCard
              title="Max Stories Per User (Daily)"
              description={settings.max_stories_per_user.description || 'Maximum stories a user can create per day'}
              setting={settings.max_stories_per_user}
              onUpdate={(value) => updateSetting('max_stories_per_user', value)}
              saving={saving === 'max_stories_per_user'}
              type="number"
            />
          )}
          {settings.site_name && (
            <SettingCard
              title="Site Name"
              description={settings.site_name.description || 'Platform name'}
              setting={settings.site_name}
              onUpdate={(value) => updateSetting('site_name', value)}
              saving={saving === 'site_name'}
              type="string"
            />
          )}
        </div>
      </div>
    </div>
  );
}

