/**
 * Report Button Component
 * 
 * Button to report inappropriate content (stories, comments).
 */

'use client';

import { useState } from 'react';
import { ReportModal } from './ReportModal';

interface ReportButtonProps {
  contentType: 'story' | 'comment' | 'post';
  contentId: string;
  variant?: 'icon' | 'text' | 'button';
  className?: string;
}

export function ReportButton({
  contentType,
  contentId,
  variant = 'icon',
  className = '',
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`text-gray-400 hover:text-red-400 transition-colors ${className}`}
          title="Report content"
          aria-label="Report content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </button>
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentType={contentType}
          contentId={contentId}
        />
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`text-sm text-gray-400 hover:text-red-400 transition-colors ${className}`}
        >
          Report
        </button>
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentType={contentType}
          contentId={contentId}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors ${className}`}
      >
        Report
      </button>
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
      />
    </>
  );
}

