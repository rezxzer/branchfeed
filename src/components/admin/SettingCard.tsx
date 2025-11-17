/**
 * Setting Card Component
 * 
 * Individual setting card with value editor.
 */

'use client';

import { useState } from 'react';

interface Setting {
  value: unknown;
  description: string | null;
  updated_at: string;
}

interface SettingCardProps {
  title: string;
  description: string | null;
  setting: Setting;
  onUpdate: (value: unknown) => void;
  saving: boolean;
  type: 'boolean' | 'number' | 'string' | 'object';
}

export function SettingCard({
  title,
  description,
  setting,
  onUpdate,
  saving,
  type,
}: SettingCardProps) {
  const [localValue, setLocalValue] = useState(setting.value);

  const handleSave = () => {
    onUpdate(localValue);
  };

  const renderInput = () => {
    if (type === 'boolean') {
      const isObjectValue = typeof setting.value === 'object' && setting.value !== null;
      const boolValue = isObjectValue
        ? (setting.value as { enabled?: boolean }).enabled ?? false
        : Boolean(setting.value);
      
      return (
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={typeof localValue === 'object' && localValue !== null
                ? (localValue as { enabled?: boolean }).enabled ?? false
                : Boolean(localValue)}
              onChange={(e) => {
                const newValue = isObjectValue
                  ? { ...(setting.value as Record<string, unknown>), enabled: e.target.checked }
                  : e.target.checked;
                setLocalValue(newValue);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-cyan"></div>
            <span className="ml-3 text-sm text-gray-300">
              {typeof localValue === 'object' && localValue !== null
                ? (localValue as { enabled?: boolean }).enabled
                  ? 'Enabled'
                  : 'Disabled'
                : Boolean(localValue)
                  ? 'Enabled'
                  : 'Disabled'}
            </span>
          </label>
        </div>
      );
    }

    if (type === 'number') {
      const isObjectValue = typeof setting.value === 'object' && setting.value !== null;
      const numValue = isObjectValue
        ? (setting.value as { value?: number }).value ?? 0
        : Number(setting.value) || 0;
      
      return (
        <input
          type="number"
          value={typeof localValue === 'object' && localValue !== null
            ? (localValue as { value?: number }).value ?? 0
            : Number(localValue) || 0}
          onChange={(e) => {
            const newValue = isObjectValue
              ? { ...(setting.value as Record<string, unknown>), value: parseInt(e.target.value, 10) }
              : parseInt(e.target.value, 10);
            setLocalValue(newValue);
          }}
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
        />
      );
    }

    if (type === 'string') {
      const isObjectValue = typeof setting.value === 'object' && setting.value !== null;
      const strValue = isObjectValue
        ? (setting.value as { value?: string }).value ?? ''
        : String(setting.value || '');
      
      return (
        <input
          type="text"
          value={typeof localValue === 'object' && localValue !== null
            ? (localValue as { value?: string }).value ?? ''
            : String(localValue || '')}
          onChange={(e) => {
            const newValue = isObjectValue
              ? { ...(setting.value as Record<string, unknown>), value: e.target.value }
              : e.target.value;
            setLocalValue(newValue);
          }}
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
        />
      );
    }

    if (type === 'object') {
      // For maintenance_mode with message
      const objValue = setting.value as { enabled?: boolean; message?: string } | null;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={objValue?.enabled ?? false}
                onChange={(e) => {
                  setLocalValue({
                    ...(objValue || {}),
                    enabled: e.target.checked,
                  });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-cyan"></div>
              <span className="ml-3 text-sm text-gray-300">
                {objValue?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Maintenance message"
            value={objValue?.message || ''}
            onChange={(e) => {
              setLocalValue({
                ...(objValue || {}),
                message: e.target.value,
              });
            }}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
          />
        </div>
      );
    }

    return null;
  };

  const hasChanges = JSON.stringify(localValue) !== JSON.stringify(setting.value);

  return (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        {renderInput()}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Last updated: {new Date(setting.updated_at).toLocaleString()}
        </span>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
        </button>
      </div>
    </div>
  );
}

