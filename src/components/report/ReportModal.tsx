/**
 * Report Modal Component
 * 
 * Modal for submitting content reports.
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'story' | 'comment' | 'post';
  contentId: string;
}

const reportReasons = [
  'Inappropriate content',
  'Spam or misleading',
  'Harassment or bullying',
  'Copyright violation',
  'Violence or dangerous content',
  'Other',
] as const;

export function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
}: ReportModalProps) {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast('Please select a reason', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason: selectedReason,
          description: description.trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.error || data.details || `Failed to submit report (${response.status})`;
        console.error('Report submission error:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          fullResponse: response,
        });
        showToast(errorMessage, 'error');
        return;
      }

      showToast('Report submitted successfully. Thank you for helping keep our community safe.', 'success');
      onClose();
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 shadow-level-3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Report Content</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Why are you reporting this {contentType}?
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-brand-cyan focus:ring-brand-cyan focus:ring-2 border-gray-600"
                  />
                  <span className="text-sm text-gray-100">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about why you're reporting this content..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gray-700/50 text-gray-100 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="flex-1 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

