/**
 * Popular Stories Component
 * 
 * Displays top stories by views.
 */

'use client';

import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  author_id: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  author: {
    id: string;
    username: string;
  };
}

interface PopularStoriesProps {
  stories: Story[];
}

export function PopularStories({ stories }: PopularStoriesProps) {
  if (stories.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Popular Stories</h3>
        <p className="text-gray-400">No stories yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Popular Stories</h3>
      <div className="space-y-3">
        {stories.map((story, index) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                  <h4 className="text-white font-medium">{story.title}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>by {story.author.username}</span>
                  <span>👁️ {story.views_count.toLocaleString()}</span>
                  <span>❤️ {story.likes_count.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

